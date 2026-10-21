import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { translateServiceCategory, translateServiceName } from '@/i18n/serviceNames';
import {
  submitWorkerRegistration,
  WorkerRegistrationSubmissionError,
} from '@/services/workerRegistrationService';
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
  width: number;
  height: number;
  size: number;
  blob?: Blob;
}

interface ServiceCategoryGroup {
  label: string;
  services: Service[];
}

function groupServicesByCategory(
  services: Service[],
  t: ReturnType<typeof useTranslation>['t'],
): ServiceCategoryGroup[] {
  const groups = new Map<string, ServiceCategoryGroup>();

  for (const service of services) {
    const label = translateServiceCategory(service.category, t) ?? t('common.service');
    const normalizedLabel = label.trim().toLowerCase();
    const group = groups.get(normalizedLabel);

    if (group) {
      group.services.push(service);
    } else {
      groups.set(normalizedLabel, { label: label.trim(), services: [service] });
    }
  }

  return Array.from(groups.values());
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
  t: ReturnType<typeof useTranslation>['t'],
): FormErrors {
  const errors: FormErrors = {};

  if (values.userName.trim().length < 2 || values.userName.trim().length > 100) {
    errors.userName = t('registration.validation.fullName');
  }
  if (!normalizeIndianPhone(values.phone)) {
    errors.phone = t('registration.validation.mobile');
  }
  if (values.alternatePhone.trim() && !normalizeIndianPhone(values.alternatePhone)) {
    errors.alternatePhone = t('registration.validation.mobile');
  }
  if (!values.serviceId) {
    errors.serviceId = t('registration.validation.category');
  }
  if (values.location.trim().length < 2 || values.location.trim().length > 160) {
    errors.location = t('registration.validation.location');
  }
  if (values.description.trim().length < 10 || values.description.trim().length > 500) {
    errors.description = t('registration.validation.description');
  }
  if (values.yearsExperience.trim()) {
    const years = Number(values.yearsExperience);
    if (!Number.isInteger(years) || years < 0 || years > 60) {
      errors.yearsExperience = t('registration.validation.experience');
    }
  }
  if (!photo) {
    errors.photo = t('registration.validation.photo');
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
  const { t } = useTranslation();
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
    if (!asset?.uri) {
      setPhotoMessage(t('registration.photoReadError'));
      return;
    }

    if (asset.type !== 'image') {
      setPhotoMessage(t('registration.photoVideo'));
      return;
    }

    const mimeType = asset.mimeType?.toLowerCase();
    const fileName = asset.fileName?.toLowerCase() ?? '';
    const hasSupportedType =
      !mimeType ||
      ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mimeType);
    const hasSupportedExtension =
      !fileName || /\.(jpe?g|png|webp|heic|heif)$/.test(fileName);

    if (!hasSupportedType || !hasSupportedExtension) {
      setPhotoMessage(t('registration.photoFormatError'));
      return;
    }
    if (asset.fileSize !== undefined && asset.fileSize > MAX_SOURCE_PHOTO_BYTES) {
      setPhotoMessage(t('registration.photoSourceSizeError'));
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
      setPhotoMessage(t('registration.photoDimensionsError'));
      return;
    }

    setIsPreparingPhoto(true);
    setPhotoMessage(t('registration.compressing'));

    try {
      const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(asset.width, asset.height));
      const image = ImageManipulator.manipulate(asset.uri);
      image.resize({
        width: Math.max(1, Math.round(asset.width * scale)),
        height: Math.max(1, Math.round(asset.height * scale)),
      });
      const rendered = await image.renderAsync();
      const saved = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.78,
      });
      if (!saved.uri || saved.width <= 0 || saved.height <= 0) {
        throw new Error(t('registration.photoReadError'));
      }

      if (__DEV__) {
        console.info('[worker-registration] Processed photo', {
          platform: Platform.OS,
          width: saved.width,
          height: saved.height,
        });
      }

      let blob: Blob | undefined;
      let size: number;
      if (Platform.OS === 'web') {
        const response = await fetch(saved.uri);
        if (!response.ok) {
          throw new Error(t('registration.photoReadError'));
        }
        blob = await response.blob();
        size = blob.size;
      } else {
        size = new File(saved.uri).size;
      }

      if (!Number.isFinite(size) || size <= 0) {
        throw new Error(t('registration.photoReadError'));
      }
      if (size > MAX_UPLOAD_PHOTO_BYTES) {
        setPhotoMessage(t('registration.photoUploadSizeError'));
        return;
      }

      setPhoto({ uri: saved.uri, width: saved.width, height: saved.height, size, blob });
      setErrors((current) => ({ ...current, photo: undefined }));
      setPhotoMessage('');
    } catch (cause) {
      if (__DEV__) {
        console.error('Unable to prepare worker registration photo:', {
          platform: Platform.OS,
          errorType: cause instanceof Error ? cause.name : typeof cause,
        });
      }
      setPhotoMessage(t('registration.photoProcessError'));
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const choosePhoto = async (source: 'gallery' | 'camera') => {
    setPhotoMessage('');

    try {
      if (source === 'gallery') {
        const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
        const permission = currentPermission.granted
          ? currentPermission
          : currentPermission.canAskAgain
            ? await ImagePicker.requestMediaLibraryPermissionsAsync()
            : currentPermission;

        if (!permission.granted) {
          setPhotoMessage(t('registration.galleryPermission'));
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
          await preparePhoto(result.assets[0]);
        } else if (!result.canceled) {
          setPhotoMessage(t('registration.photoReadError'));
        } else {
          setPhotoMessage(t('registration.galleryCancelled'));
        }
        return;
      }

      const currentPermission = await ImagePicker.getCameraPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : currentPermission.canAskAgain
          ? await ImagePicker.requestCameraPermissionsAsync()
          : currentPermission;

      if (!permission.granted) {
        setPhotoMessage(t('registration.cameraPermission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await preparePhoto(result.assets[0]);
      } else if (!result.canceled) {
        setPhotoMessage(t('registration.photoReadError'));
      } else {
        setPhotoMessage(t('registration.cameraCancelled'));
      }
    } catch (cause) {
      if (__DEV__) {
        console.error('Unable to select worker registration photo:', {
          platform: Platform.OS,
          errorType: cause instanceof Error ? cause.name : typeof cause,
        });
      }
      setPhotoMessage(t('registration.pickerFailed'));
    }
  };

  const handleSubmit = async () => {
    if (submitLock.current || isSubmitting || submitted) {
      return;
    }
    const validationErrors = validateForm(
      { userName, phone, alternatePhone, serviceId, location, description, yearsExperience },
      photo,
      t,
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

    const photoForSubmission =
      Platform.OS === 'web'
        ? photo.blob
        : { uri: photo.uri, name: 'profile.jpg', type: 'image/jpeg' };
    if (!photoForSubmission) {
      setSubmitError(t('registration.photoReadError'));
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);

    try {
      if (__DEV__) {
        console.info('[worker-registration] Submitting processed photo', {
          platform: Platform.OS,
          width: photo.width,
          height: photo.height,
          size: photo.size,
        });
      }
      await submitWorkerRegistration({
        userName: userName.trim(),
        phone: normalizedPhone,
        alternatePhone: normalizedAlternatePhone,
        serviceId,
        location: location.trim(),
        description: description.trim(),
        yearsExperience: yearsExperience.trim() ? Number(yearsExperience) : undefined,
        submissionToken,
        photo: photoForSubmission,
      });
      setSubmitted(true);
    } catch (cause: unknown) {
      if (cause instanceof WorkerRegistrationSubmissionError) {
        if (cause.status === 429) {
          setSubmitError(t('registration.rateLimited'));
        } else if (cause.status !== undefined && cause.status >= 500) {
          setSubmitError(t('registration.serverError'));
        } else if (cause.kind === 'network') {
          setSubmitError(t('common.checkConnection'));
        } else if (
          cause.status !== undefined &&
          cause.status >= 400 &&
          cause.status < 500 &&
          cause.responseBody?.error
        ) {
          setSubmitError(cause.responseBody.error);
        } else {
          setSubmitError(t('registration.submitError'));
        }
      } else {
        setSubmitError(t('registration.submitError'));
      }
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
                accessibilityLabel={t('common.goBack')}
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={21} color={colors.text} />
              </Pressable>
              <View style={styles.headerText}>
                <AppText variant="title" style={styles.title}>{t('registration.title')}</AppText>
                <AppText style={styles.subtitle}>
                  {t('registration.subtitle')}
                </AppText>
              </View>
            </View>

            {submitted ? (
              <View style={styles.successCard} accessibilityRole="alert">
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={28} color={colors.success} />
                </View>
                <AppText variant="subtitle" style={styles.successTitle}>{t('registration.successTitle')}</AppText>
                <AppText style={styles.successMessage}>
                  {t('registration.successMessage')}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace('/(tabs)/home')}
                  style={styles.primaryButton}
                >
                  <AppText style={styles.primaryButtonText}>{t('common.backToHome')}</AppText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formCard}>
                <AppText style={styles.sectionTitle}>{t('registration.detailsTitle')}</AppText>

                {renderTextInput('userName', t('registration.fullName'), userName, setUserName, {
                  placeholder: t('registration.fullNamePlaceholder'),
                  maxLength: 100,
                })}
                {renderTextInput('phone', t('registration.mobile'), phone, setPhone, {
                  keyboardType: 'phone-pad',
                  placeholder: t('registration.mobilePlaceholder'),
                  maxLength: 16,
                })}
                {renderTextInput('alternatePhone', t('registration.alternateMobile'), alternatePhone, setAlternatePhone, {
                  keyboardType: 'phone-pad',
                  placeholder: t('registration.alternateMobilePlaceholder'),
                  maxLength: 16,
                })}

                <View style={styles.field}>
                  <AppText style={styles.label}>{t('registration.category')}</AppText>
                  {isLoadingServices ? (
                    <View style={styles.categoryLoading}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <AppText style={styles.helperText}>{t('registration.loadingCategories')}</AppText>
                    </View>
                  ) : servicesError ? (
                    <View style={styles.categoryError}>
                      <AppText style={styles.fieldError}>
                        {t('registration.categoriesUnavailable')}
                      </AppText>
                      <Pressable accessibilityRole="button" onPress={retry}>
                        <AppText style={styles.retryText}>{t('common.tryAgain')}</AppText>
                      </Pressable>
                    </View>
                  ) : services.length === 0 ? (
                    <AppText style={styles.helperText}>{t('registration.noCategories')}</AppText>
                  ) : (
                    <View style={styles.categoryGroups}>
                      {groupServicesByCategory(services, t).map((group) => {
                        const serviceLabels = group.services.map((service) =>
                          translateServiceName(service.id, service.name, t).trim(),
                        );
                        const labelCounts = new Map<string, number>();
                        for (const label of serviceLabels) {
                          const key = label.toLowerCase();
                          labelCounts.set(key, (labelCounts.get(key) ?? 0) + 1);
                        }

                        return (
                          <View key={group.label.toLowerCase()} style={styles.categoryGroup}>
                            <AppText style={styles.categoryHeading}>{group.label}</AppText>
                            <View style={styles.categoryList}>
                              {group.services.map((service, index) => {
                                const isSelected = service.id === serviceId;
                                const label = serviceLabels[index];
                                const displayLabel =
                                  (labelCounts.get(label.toLowerCase()) ?? 0) > 1
                                    ? `${label} (${service.id})`
                                    : label;

                                return (
                                  <Pressable
                                    key={service.id}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isSelected }}
                                    onPress={() => {
                                      setServiceId(service.id);
                                      setErrors((current) => ({ ...current, serviceId: undefined }));
                                    }}
                                    style={[
                                      styles.categoryChip,
                                      isSelected && styles.categoryChipSelected,
                                    ]}
                                  >
                                    <AppText
                                      style={[
                                        styles.categoryChipText,
                                        isSelected && styles.categoryChipTextSelected,
                                      ]}
                                    >
                                      {displayLabel}
                                    </AppText>
                                  </Pressable>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  <FieldError message={errors.serviceId} />
                </View>

                {renderTextInput('location', t('registration.location'), location, setLocation, {
                  placeholder: t('registration.locationPlaceholder'),
                  maxLength: 160,
                })}
                {renderTextInput('description', t('registration.description'), description, setDescription, {
                  placeholder: t('registration.descriptionPlaceholder'),
                  multiline: true,
                  maxLength: 500,
                })}
                {renderTextInput('yearsExperience', t('registration.experience'), yearsExperience, setYearsExperience, {
                  keyboardType: 'number-pad',
                  placeholder: t('registration.experiencePlaceholder'),
                  maxLength: 2,
                })}

                <View style={styles.field}>
                  <AppText style={styles.label}>{t('registration.photo')}</AppText>
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
                        <AppText style={styles.photoButtonText}>{t('registration.chooseGallery')}</AppText>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void choosePhoto('camera')}
                        disabled={isPreparingPhoto || isSubmitting}
                        style={styles.photoButton}
                      >
                        <Ionicons name="camera-outline" size={18} color={colors.primaryDark} />
                        <AppText style={styles.photoButtonText}>{t('registration.takePhoto')}</AppText>
                      </Pressable>
                    </View>
                  </View>
                  {isPreparingPhoto ? (
                    <View style={styles.photoProgress}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <AppText style={styles.helperText}>{t('registration.compressing')}</AppText>
                    </View>
                  ) : null}
                  {photoMessage ? <AppText style={styles.fieldError}>{photoMessage}</AppText> : null}
                  <FieldError message={errors.photo} />
                  <AppText style={styles.helperText}>
                    {t('registration.photoFormats')}
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
                      <AppText style={styles.primaryButtonText}>{t('registration.submitting')}</AppText>
                    </>
                  ) : (
                    <AppText style={styles.primaryButtonText}>{t('registration.submit')}</AppText>
                  )}
                </Pressable>
                <AppText style={styles.privacyNote}>
                  {t('registration.privacy')}
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
  categoryGroups: {
    gap: 14,
  },
  categoryGroup: {
    gap: 7,
  },
  categoryHeading: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
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
