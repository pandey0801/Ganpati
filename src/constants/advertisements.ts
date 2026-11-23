import type { ImageSourcePropType } from 'react-native';

export type AdvertisementActionType = 'website' | 'whatsapp' | 'phone' | 'maps' | 'internal';

type LocalizedText = {
  en: string;
  hi: string;
};

type LocalizedImage = {
  en: ImageSourcePropType;
  hi: ImageSourcePropType;
};

export interface Advertisement {
  id: string;
  businessName: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  image: LocalizedImage;
  actionType: AdvertisementActionType;
  actionUrl: string;
  buttonText: LocalizedText;
  active: boolean;
}

export const advertisements: Advertisement[] = [
  {
    id: 'abc-jewellery',
    businessName: { en: 'ABC Jewellery', hi: 'एबीसी ज्वेलरी' },
    title: { en: 'Special Festival Offers', hi: 'त्योहार के विशेष ऑफ़र' },
    description: {
      en: 'Flat 20% OFF on Gold Jewellery',
      hi: 'सोने के आभूषणों पर 20% की छूट',
    },
    image: {
      en: require('../../assets/images/advertisements/abc-jewellery.png'),
      hi: require('../../assets/images/advertisements/abc-jewellery-hi.png'),
    },
    actionType: 'website',
    actionUrl: 'https://example.com',
    buttonText: { en: 'Visit Now', hi: 'अभी देखें' },
    active: true,
  },
  {
    id: 'city-food-corner',
    businessName: { en: 'City Food Corner', hi: 'सिटी फ़ूड कॉर्नर' },
    title: { en: 'Delicious Food Combos', hi: 'स्वादिष्ट फ़ूड कॉम्बो' },
    description: { en: 'Special Weekend Combo', hi: 'विशेष वीकेंड कॉम्बो' },
    image: {
      en: require('../../assets/images/advertisements/city-food-corner.png'),
      hi: require('../../assets/images/advertisements/city-food-corner-hi.png'),
    },
    actionType: 'website',
    actionUrl: 'https://example.com',
    buttonText: { en: 'Explore Offer', hi: 'ऑफ़र देखें' },
    active: true,
  },
  {
    id: 'ambikapur-electronics',
    businessName: { en: 'Ambikapur Electronics', hi: 'अंबिकापुर इलेक्ट्रॉनिक्स' },
    title: { en: 'Upgrade Your Smartphone', hi: 'अपना स्मार्टफोन अपग्रेड करें' },
    description: {
      en: 'Explore Our Latest Mobile Collection',
      hi: 'नवीनतम मोबाइल संग्रह देखें',
    },
    image: {
      en: require('../../assets/images/advertisements/ambikapur-electronics.png'),
      hi: require('../../assets/images/advertisements/ambikapur-electronics-hi.png'),
    },
    actionType: 'website',
    actionUrl: 'https://example.com',
    buttonText: { en: 'Explore Now', hi: 'अभी देखें' },
    active: true,
  },
];
