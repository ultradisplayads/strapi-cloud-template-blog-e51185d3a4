import type { Schema, Struct } from '@strapi/strapi';

export interface DealsTieredDiscount extends Struct.ComponentSchema {
  collectionName: 'components_deals_tiered_discounts';
  info: {
    description: 'Discount that increases based on quantity purchased';
    displayName: 'Tiered Discount';
  };
  attributes: {
    description: Schema.Attribute.String;
    discount_percentage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    max_quantity: Schema.Attribute.Integer;
    min_quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface DealsTimeBasedDiscount extends Struct.ComponentSchema {
  collectionName: 'components_deals_time_based_discounts';
  info: {
    description: 'Discount that applies during specific time periods';
    displayName: 'Time Based Discount';
  };
  attributes: {
    days_of_week: Schema.Attribute.Enumeration<
      [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]
    >;
    discount_percentage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    end_time: Schema.Attribute.Time & Schema.Attribute.Required;
    start_time: Schema.Attribute.Time & Schema.Attribute.Required;
  };
}

export interface RadioSponsoredWidgetBanner extends Struct.ComponentSchema {
  collectionName: 'components_radio_sponsored_widget_banners';
  info: {
    description: 'Banner for sponsoring the entire radio widget';
    displayName: 'Sponsored Widget Banner';
  };
  attributes: {
    bannerPosition: Schema.Attribute.Enumeration<['top', 'bottom', 'overlay']> &
      Schema.Attribute.DefaultTo<'top'>;
    isSponsored: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    sponsorColor: Schema.Attribute.String;
    sponsorEndDate: Schema.Attribute.Date;
    sponsorLogo: Schema.Attribute.Media<'images'>;
    sponsorMessage: Schema.Attribute.String;
    sponsorName: Schema.Attribute.String;
    sponsorStartDate: Schema.Attribute.Date;
    sponsorWebsite: Schema.Attribute.String;
  };
}

export interface ReusableAmenities extends Struct.ComponentSchema {
  collectionName: 'components_reusable_amenities';
  info: {
    displayName: 'Amenities';
    icon: 'house';
  };
  attributes: {
    airConditioning: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    creditCardsAccepted: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    customAmenities: Schema.Attribute.JSON;
    parking: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    wheelchairAccessible: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    wifi: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface ReusableBusinessHours extends Struct.ComponentSchema {
  collectionName: 'components_reusable_business_hours';
  info: {
    displayName: 'Business Hours';
    icon: 'clock';
  };
  attributes: {
    friday: Schema.Attribute.String;
    monday: Schema.Attribute.String;
    saturday: Schema.Attribute.String;
    sunday: Schema.Attribute.String;
    thursday: Schema.Attribute.String;
    tuesday: Schema.Attribute.String;
    wednesday: Schema.Attribute.String;
  };
}

export interface ReusableContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_reusable_contact_infos';
  info: {
    displayName: 'Contact Info';
    icon: 'pinMap';
  };
  attributes: {
    email: Schema.Attribute.Email;
    lineId: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    website: Schema.Attribute.String;
    whatsapp: Schema.Attribute.String;
  };
}

export interface ReusableLocation extends Struct.ComponentSchema {
  collectionName: 'components_reusable_locations';
  info: {
    displayName: 'Location';
    icon: 'globe';
  };
  attributes: {
    address: Schema.Attribute.String & Schema.Attribute.Required;
    city: Schema.Attribute.String;
    country: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Thailand'>;
    formattedAddress: Schema.Attribute.Text;
    latitutde: Schema.Attribute.Decimal;
    longitude: Schema.Attribute.Decimal;
    postalCode: Schema.Attribute.String;
    state: Schema.Attribute.String;
  };
}

export interface ReusablePricing extends Struct.ComponentSchema {
  collectionName: 'components_reusable_pricings';
  info: {
    displayName: 'Pricing';
    icon: 'priceTag';
  };
  attributes: {
    amount: Schema.Attribute.Decimal;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'THB'>;
    description: Schema.Attribute.Text;
    type: Schema.Attribute.Enumeration<['free', 'paid', 'donation']>;
  };
}

export interface ReusableSeoMetadata extends Struct.ComponentSchema {
  collectionName: 'components_reusable_seo_metadata';
  info: {
    displayName: 'SEO Metadata';
  };
  attributes: {
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    ogDescription: Schema.Attribute.Text;
    ogImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    ogTitle: Schema.Attribute.String;
  };
}

export interface ReusableSocialMedia extends Struct.ComponentSchema {
  collectionName: 'components_reusable_social_medias';
  info: {
    displayName: 'Social Media';
    icon: 'globe';
  };
  attributes: {
    facebook: Schema.Attribute.String;
    instagram: Schema.Attribute.String;
    line: Schema.Attribute.String;
    twitter: Schema.Attribute.String;
    youtube: Schema.Attribute.String;
  };
}

export interface ReusableTags extends Struct.ComponentSchema {
  collectionName: 'components_reusable_tags';
  info: {
    displayName: 'Tags';
    icon: 'priceTag';
  };
  attributes: {
    tags: Schema.Attribute.JSON;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'deals.tiered-discount': DealsTieredDiscount;
      'deals.time-based-discount': DealsTimeBasedDiscount;
      'radio.sponsored-widget-banner': RadioSponsoredWidgetBanner;
      'reusable.amenities': ReusableAmenities;
      'reusable.business-hours': ReusableBusinessHours;
      'reusable.contact-info': ReusableContactInfo;
      'reusable.location': ReusableLocation;
      'reusable.pricing': ReusablePricing;
      'reusable.seo-metadata': ReusableSeoMetadata;
      'reusable.social-media': ReusableSocialMedia;
      'reusable.tags': ReusableTags;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
