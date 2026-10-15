import { Ionicons } from '@expo/vector-icons';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';
import { useServices } from '@/hooks/useServices';
import { submitWorkerRegistration } from '@/services/workerRegistrationService';
import { Service } from '@/types/service';

const MAX_SOURCE_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_PHOTO_BYTES = 4 * 1024 * 1024;
const MAX_PHOTO_DIMENSION = 1280;

type FormField =
  | 'userName'
  | 'phone'
  | 'alternatePhone'
  | 'serviceId'
  | 'location'
  | 'description'
  | 'yearsExperience';

type FormErrors = Partial<Record<FormField | 'photo', string>>;

interface SelectedPhoto {
  uri: string;
  blob: Blob;
}

function normalizeIndianPhone(value: string): string | undefined {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : undefined;
}

function validateForm(
  values: {
    userName: string;
    phone: string;
    alternatePhone: string;
    serviceId: string;
    location: string;
    description: string;
    yearsExperience: string;
  },
  photo: SelectedPhoto | null,
): FormErrors {
  const errors: FormErrors = {};

  if (values.userName.trim().length < 2 || values.userName.trim().length > 100) {
    errors.userName = 'Enter your full name (2–100 characters).';
  }
  if (!normalizeIndianPhone(values.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  }
  if (values.alternatePhone.trim() && !normalizeIndianPhone(values.alternatePhone)) {
    errors.alternatePhone = 'Enter a valid 10-digit Indian mobile number.';
  }
  if (!values.serviceId) {
    errors.serviceId = 'Choose a service category.';
  }
  if (values.location.trim().length < 2 || values.location.trim().length > 160) {
    errors.location = 'Enter your city, locality, or service location.';
  }
  if (values.description.trim().length < 10 || values.description.trim().length > 500) {
    errors.description = 'Describe your work in 10–500 characters.';
  }
  if (values.yearsExperience.trim()) {
    const years = Number(values.yearsExperience);
    if (!Number.isInteger(years) || years < 0 || years > 60) {
      errors.yearsExperience = 'Enter a whole number from 0 to 60.';
    }
  }
  if (!photo) {
    errors.photo = 'Add a profile photo to continue.';
  }

  return errors;
}

function createSubmissionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <AppText style={styles.fieldError}>{message}</AppText>;
}

export default function WorkerRegistrationScreen() {
  const router = useRouter();
  const { services, isLoading: isLoadingServices, error: servicesError, retry } = useServices();
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoMessage, setPhotoMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submitLock = useRef(false);
  const [submissionToken] = useState(createSubmissionToken);

  const updateField = (field: FormField, value: string, update: (next: string) => void) => {
    update(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  };

  const preparePhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    console.log("Preparing photo with asset:", asset);
    if (asset.type !== 'image') {
      setPhotoMessage('Choose an image file, not a video.');
      return;
    }

    const mimeType = asset.mimeType?.toLowerCase();
    console.log("Asset mimeType:", mimeType);
    const fileName = asset.fileName?.toLowerCase() ?? '';
    console.log("Asset fileName:", fileName);
    const hasSupportedType =
      !mimeType ||
      ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mimeType);
    const hasSupportedExtension =
      !fileName || /\.(jpe?g|png|webp|heic|heif)$/.test(fileName);

    if (!hasSupportedType || !hasSupportedExtension) {
      setPhotoMessage('Choose a JPEG, PNG, WebP, or HEIC photo.');
      return;
    }
    if (asset.fileSize !== undefined && asset.fileSize > MAX_SOURCE_PHOTO_BYTES) {
      setPhotoMessage('Choose a photo smaller than 15 MB.');
      return;
    }
    if (
      !Number.isFinite(asset.width) ||
      !Number.isFinite(asset.height) ||
      asset.width <= 0 ||
      asset.height <= 0 ||
      asset.width > 20000 ||
      asset.height > 20000
    ) {
      setPhotoMessage('This photo has invalid dimensions. Choose another image.');
      return;
    }

    setIsPreparingPhoto(true);
    setPhotoMessage('Preparing your photo…');

    try {
      const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(asset.width, asset.height));
      const image = ImageManipulator.manipulate(asset.uri);
      console.log("imageManipulator ",image);
      image.resize({
        width: Math.max(1, Math.round(asset.width * scale)),
        height: Math.max(1, Math.round(asset.height * scale)),
      });
      console.log("Resized image:", image);
      const rendered = await image.renderAsync();
      console.log("Rendered image:", rendered);
      const saved = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.78,
      });
      console.log("Saved image:", saved); 
      const response = await fetch(saved.uri);
      console.log("Fetched saved image response:", response); 

      if (!response.ok) {
        throw new Error('Could not read the processed photo.');
      }

      const blob = await response.blob();
      console.log("Blob", blob);
      if (blob.size === 0 || blob.size > MAX_UPLOAD_PHOTO_BYTES) {
        setPhotoMessage('The compressed photo must be smaller than 4 MB. Choose another photo.');
        return;
      }

      setPhoto({ uri: saved.uri, blob });
      console.log("Photo set successfully:", { uri: saved.uri, blob });
      setErrors((current) => ({ ...current, photo: undefined }));
      setPhotoMessage('');
    } catch (cause) {
      if (__DEV__) {
        console.error('Unable to prepare worker registration photo:', cause);
      }
      setPhotoMessage('Could not process this photo. Please choose another one.');
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const choosePhoto = async (source: 'gallery' | 'camera') => {
    console.log("choosePhoto called with source:", source);
    setPhotoMessage('');

    try {
      if (source === 'gallery') {
        const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
        console.log("Current media library permission:", currentPermission);
        const permission = currentPermission.granted
          ? currentPermission
          : currentPermission.canAskAgain
            ? await ImagePicker.requestMediaLibraryPermissionsAsync()
            : currentPermission;

        console.log("Media library permission after request:", permission);

        if (!permission.granted) {
          setPhotoMessage('Photo library access is needed to choose a profile photo.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });

        console.log("Image library result:", result);

        if (!result.canceled) {
          await preparePhoto(result.assets[0]);
        } else {
          setPhotoMessage('Photo selection was cancelled. You can choose or take a photo when ready.');
        }
        return;
      }

      const currentPermission = await ImagePicker.getCameraPermissionsAsync();
      console.log("Current camera permission:", currentPermission);
      const permission = currentPermission.granted
        ? currentPermission
        : currentPermission.canAskAgain
          ? await ImagePicker.requestCameraPermissionsAsync()
          : currentPermission;

      if (!permission.granted) {
        setPhotoMessage('Camera access is needed to take a profile photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log("Camera result:", result);  
      if (!result.canceled) {
        await preparePhoto(result.assets[0]);
      } else {
        setPhotoMessage('Camera was cancelled. You can choose or take a photo when ready.');
      }
    } catch (cause) {
      if (__DEV__) {
        console.error('Unable to select worker registration photo:', cause);
      }
      setPhotoMessage('The photo picker could not be opened. Check permissions and try again.');
    }
  };

  const handleSubmit = async () => {
    if (submitLock.current || isSubmitting || submitted) {
      return;
    }

    const validationErrors = validateForm(
      { userName, phone, alternatePhone, serviceId, location, description, yearsExperience },
      photo,
    );
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    const normalizedAlternatePhone = alternatePhone.trim()
      ? normalizeIndianPhone(alternatePhone)
      : undefined;

    if (!normalizedPhone || (alternatePhone.trim() && !normalizedAlternatePhone) || !photo) {
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);

    try {
      await submitWorkerRegistration({
        userName: userName.trim(),
        phone: normalizedPhone,
        alternatePhone: normalizedAlternatePhone,
        serviceId,
        location: location.trim(),
        description: description.trim(),
        yearsExperience: yearsExperience.trim() ? Number(yearsExperience) : undefined,
        submissionToken,
        photo: photo.blob,
      });
      setSubmitted(true);
    } catch (cause) {
      setSubmitError(
        cause instanceof Error
          ? cause.message
          : 'Unable to submit your registration. Please try again.',
      );
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const renderTextInput = (
    field: FormField,
    label: string,
    value: string,
    update: (next: string) => void,
    options: {
      keyboardType?: 'default' | 'phone-pad' | 'number-pad';
      placeholder: string;
      multiline?: boolean;
      maxLength?: number;
      autoCapitalize?: 'none' | 'sentences' | 'words';
    },
  ) => (
    <View style={styles.field}>
      <AppText style={styles.label}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={(next) => updateField(field, next, update)}
        placeholder={options.placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={options.keyboardType ?? 'default'}
        autoCapitalize={options.autoCapitalize ?? 'sentences'}
        autoCorrect={field === 'description'}
        maxLength={options.maxLength}
        multiline={options.multiline}
        textAlignVertical={options.multiline ? 'top' : 'center'}
        style={[
          styles.input,
          options.multiline && styles.multilineInput,
          errors[field] && styles.inputError,
        ]}
        editable={!isSubmitting && !submitted}
        selectionColor={colors.primary}
      />
      <FieldError message={errors[field]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={21} color={colors.text} />
              </Pressable>
              <View style={styles.headerText}>
                <AppText variant="title" style={styles.title}>Register as a Worker</AppText>
                <AppText style={styles.subtitle}>
                  Share your details to join our trusted local network.
                </AppText>
              </View>
            </View>

            {submitted ? (
              <View style={styles.successCard} accessibilityRole="alert">
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={28} color={colors.success} />
                </View>
                <AppText variant="subtitle" style={styles.successTitle}>Registration submitted</AppText>
                <AppText style={styles.successMessage}>
                  Your registration has been submitted successfully. Our team will review your details before your profile becomes visible in the app.
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace('/(tabs)/home')}
                  style={styles.primaryButton}
                >
                  <AppText style={styles.primaryButtonText}>Back to Home</AppText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formCard}>
                <AppText style={styles.sectionTitle}>Your details</AppText>

                {renderTextInput('userName', 'Full name *', userName, setUserName, {
                  placeholder: 'Enter your full name',
                  maxLength: 100,
                })}
                {renderTextInput('phone', 'Mobile number *', phone, setPhone, {
                  keyboardType: 'phone-pad',
                  placeholder: '10-digit Indian mobile number',
                  maxLength: 16,
                })}
                {renderTextInput('alternatePhone', 'Alternate mobile number (optional)', alternatePhone, setAlternatePhone, {
                  keyboardType: 'phone-pad',
                  placeholder: 'Alternate mobile number',
                  maxLength: 16,
                })}

                <View style={styles.field}>
                  <AppText style={styles.label}>Service category *</AppText>
                  {isLoadingServices ? (
                    <View style={styles.categoryLoading}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <AppText style={styles.helperText}>Loading service categories…</AppText>
                    </View>
                  ) : servicesError ? (
                    <View style={styles.categoryError}>
                      <AppText style={styles.fieldError}>
                        Could not load service categories. Check your connection.
                      </AppText>
                      <Pressable accessibilityRole="button" onPress={retry}>
                        <AppText style={styles.retryText}>Try again</AppText>
                      </Pressable>
                    </View>
                  ) : services.length === 0 ? (
                    <AppText style={styles.helperText}>No service categories are available yet.</AppText>
                  ) : (
                    <View style={styles.categoryList}>
                      {services.map((service: Service) => {
                        const isSelected = service.id === serviceId;
                        return (
                          <Pressable
                            key={service.id}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: isSelected }}
                            onPress={() => {
                              setServiceId(service.id);
                              setErrors((current) => ({ ...current, serviceId: undefined }));
                            }}
                            style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                          >
                            <AppText
                              style={[
                                styles.categoryChipText,
                                isSelected && styles.categoryChipTextSelected,
                              ]}
                            >
                              {service.category || service.name}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                  <FieldError message={errors.serviceId} />
                </View>

                {renderTextInput('location', 'City / locality or service location *', location, setLocation, {
                  placeholder: 'e.g. Ambikapur, Chhattisgarh',
                  maxLength: 160,
                })}
                {renderTextInput('description', 'Short description of work offered *', description, setDescription, {
                  placeholder: 'Describe the services you provide and your skills',
                  multiline: true,
                  maxLength: 500,
                })}
                {renderTextInput('yearsExperience', 'Years of experience (optional)', yearsExperience, setYearsExperience, {
                  keyboardType: 'number-pad',
                  placeholder: 'e.g. 5',
                  maxLength: 2,
                })}

                <View style={styles.field}>
                  <AppText style={styles.label}>Profile photo *</AppText>
                  <View style={styles.photoPicker}>
                    {photo ? (
                      <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons name="person-outline" size={30} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.photoActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void choosePhoto('gallery')}
                        disabled={isPreparingPhoto || isSubmitting}
                        style={styles.photoButton}
                      >
                        <Ionicons name="images-outline" size={18} color={colors.primaryDark} />
                        <AppText style={styles.photoButtonText}>Choose from Gallery</AppText>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void choosePhoto('camera')}
                        disabled={isPreparingPhoto || isSubmitting}
                        style={styles.photoButton}
                      >
                        <Ionicons name="camera-outline" size={18} color={colors.primaryDark} />
                        <AppText style={styles.photoButtonText}>Take Photo</AppText>
                      </Pressable>
                    </View>
                  </View>
                  {isPreparingPhoto ? (
                    <View style={styles.photoProgress}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <AppText style={styles.helperText}>Compressing photo…</AppText>
                    </View>
                  ) : null}
                  {photoMessage ? <AppText style={styles.fieldError}>{photoMessage}</AppText> : null}
                  <FieldError message={errors.photo} />
                  <AppText style={styles.helperText}>
                    JPEG, PNG, WebP, or HEIC. Photos are compressed before private upload.
                  </AppText>
                </View>

                {submitError ? (
                  <AppText style={styles.submitError} accessibilityRole="alert">
                    {submitError}
                  </AppText>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleSubmit()}
                  disabled={isSubmitting || isPreparingPhoto || isLoadingServices || services.length === 0}
                  style={[
                    styles.primaryButton,
                    (isSubmitting || isPreparingPhoto || isLoadingServices || services.length === 0) &&
                      styles.primaryButtonDisabled,
                  ]}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator size="small" color={colors.text} />
                      <AppText style={styles.primaryButtonText}>Uploading photo and submitting…</AppText>
                    </>
                  ) : (
                    <AppText style={styles.primaryButtonText}>Submit Registration</AppText>
                  )}
                </Pressable>
                <AppText style={styles.privacyNote}>
                  Your profile photo and details stay private until your registration is reviewed.
                </AppText>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 18,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerText: {
    flex: 1,
    paddingTop: 1,
  },
  title: {
    fontSize: 23,
    lineHeight: 29,
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 14,
  },
  formCard: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.text,
    fontSize: 18,
  },
  field: {
    marginBottom: 17,
  },
  label: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 112,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    marginTop: 5,
    color: colors.error,
    fontSize: 12,
    lineHeight: 17,
  },
  helperText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  categoryLoading: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  categoryError: {
    gap: 8,
  },
  retryText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  categoryChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: colors.primaryDark,
  },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  photoPreview: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  photoPlaceholder: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
  },
  photoActions: {
    flex: 1,
    gap: 8,
  },
  photoButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
  },
  photoButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  photoProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 9,
  },
  submitError: {
    marginBottom: 12,
    color: colors.error,
    fontSize: 13,
  },
  primaryButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  privacyNote: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  successCard: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  successIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#EAF7EE',
  },
  successTitle: {
    marginTop: 16,
    color: colors.text,
    textAlign: 'center',
  },
  successMessage: {
    marginTop: 10,
    marginBottom: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
