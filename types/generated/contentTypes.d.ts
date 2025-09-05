import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAboutAbout extends Struct.SingleTypeSchema {
  collectionName: 'abouts';
  info: {
    description: 'Write about yourself and the content you create';
    displayName: 'About';
    pluralName: 'abouts';
    singularName: 'about';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    blocks: Schema.Attribute.DynamicZone<
      [
        'shared.media',
        'shared.quote',
        'shared.rich-text',
        'shared.slider',
        'reusable.location',
      ]
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::about.about'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAdvertisementAdvertisement
  extends Struct.CollectionTypeSchema {
  collectionName: 'advertisements';
  info: {
    displayName: 'Advertisement';
    pluralName: 'advertisements';
    singularName: 'advertisement';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Content: Schema.Attribute.Text & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::advertisement.advertisement'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    PublishedTimestamp: Schema.Attribute.DateTime;
    Sponsor: Schema.Attribute.String & Schema.Attribute.Required;
    Tiltle: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    URL: Schema.Attribute.String & Schema.Attribute.Required;
    WidgetTarget: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'breaking-news'>;
  };
}

export interface ApiAuthorAuthor extends Struct.CollectionTypeSchema {
  collectionName: 'authors';
  info: {
    description: 'Create authors for your content';
    displayName: 'Author';
    pluralName: 'authors';
    singularName: 'author';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    avatar: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::author.author'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBookingBooking extends Struct.CollectionTypeSchema {
  collectionName: 'bookings';
  info: {
    displayName: 'Booking';
    pluralName: 'bookings';
    singularName: 'booking';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    booking_date_time: Schema.Attribute.DateTime;
    confirmation_code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    confirmation_token: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    customer_email: Schema.Attribute.Email;
    customer_name: Schema.Attribute.String;
    customer_phone: Schema.Attribute.String;
    deal: Schema.Attribute.Relation<'manyToOne', 'api::deal.deal'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::booking.booking'
    > &
      Schema.Attribute.Private;
    notes: Schema.Attribute.Text;
    paid_at: Schema.Attribute.DateTime;
    payment_status: Schema.Attribute.Enumeration<
      ['pending', 'paid', 'failed', 'refunded', 'cancelled']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    publishedAt: Schema.Attribute.DateTime;
    purchase_date: Schema.Attribute.DateTime & Schema.Attribute.Required;
    qr_code_data: Schema.Attribute.Text;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    refunded_at: Schema.Attribute.DateTime;
    special_requests: Schema.Attribute.Text;
    status: Schema.Attribute.Enumeration<
      [
        'Pending User Confirmation',
        'Confirmed',
        'Redeemed',
        'Expired',
        'Cancelled',
      ]
    > &
      Schema.Attribute.DefaultTo<'Pending User Confirmation'>;
    stripe_payment_intent_id: Schema.Attribute.String;
    stripe_refund_id: Schema.Attribute.String;
    total_amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiBreakingNewsBreakingNews
  extends Struct.CollectionTypeSchema {
  collectionName: 'breaking_news_plural';
  info: {
    displayName: 'Breaking News';
    pluralName: 'breaking-news-plural';
    singularName: 'breaking-news';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    apiSource: Schema.Attribute.String;
    Category: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    downvotes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    FeaturedImage: Schema.Attribute.String;
    fetchedFromAPI: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    ImageAlt: Schema.Attribute.String;
    ImageCaption: Schema.Attribute.Text;
    IsBreaking: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isHidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isPinned: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::breaking-news.breaking-news'
    > &
      Schema.Attribute.Private;
    moderationStatus: Schema.Attribute.Enumeration<
      ['approved', 'pending', 'rejected', 'needs_review']
    > &
      Schema.Attribute.DefaultTo<'approved'>;
    originalAPIData: Schema.Attribute.JSON;
    pinnedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    PublishedTimestamp: Schema.Attribute.DateTime;
    Severity: Schema.Attribute.Enumeration<
      ['low', 'medium', 'high', 'critical']
    >;
    Source: Schema.Attribute.String & Schema.Attribute.Required;
    SponsoredPost: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    sponsorName: Schema.Attribute.String;
    Summary: Schema.Attribute.Text & Schema.Attribute.Required;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    upvotes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    URL: Schema.Attribute.String & Schema.Attribute.Required;
    voteScore: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiBusinessSpotlightBusinessSpotlight
  extends Struct.CollectionTypeSchema {
  collectionName: 'business_spotlights';
  info: {
    displayName: 'Business Spotlight';
    pluralName: 'business-spotlights';
    singularName: 'business-spotlight';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Address: Schema.Attribute.Text;
    Category: Schema.Attribute.Enumeration<
      [
        'Fine Dining',
        'Casual Dining',
        'Health & Beauty',
        'Water Sports',
        'Shopping',
        'Entertainment',
        'Wellness',
        'Adventure',
        'Nightlife',
        'Culture',
      ]
    > &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Deal: Schema.Attribute.String;
    Description: Schema.Attribute.Text & Schema.Attribute.Required;
    Email: Schema.Attribute.String;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Hours: Schema.Attribute.String;
    Image: Schema.Attribute.Media<'images'>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::business-spotlight.business-spotlight'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String & Schema.Attribute.Required;
    Name: Schema.Attribute.String & Schema.Attribute.Required;
    Phone: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    Rating: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    Reviews: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    SocialMedia: Schema.Attribute.JSON;
    Tags: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Website: Schema.Attribute.String;
  };
}

export interface ApiBusinessBusiness extends Struct.CollectionTypeSchema {
  collectionName: 'businesses';
  info: {
    displayName: 'Business';
    pluralName: 'businesses';
    singularName: 'business';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    address: Schema.Attribute.Component<'reusable.location', true> &
      Schema.Attribute.Required;
    amenities: Schema.Attribute.Component<'reusable.amenities', true>;
    booking_notification_email: Schema.Attribute.Email &
      Schema.Attribute.Required;
    categories: Schema.Attribute.Relation<
      'manyToMany',
      'api::category.category'
    >;
    contact: Schema.Attribute.Component<'reusable.contact-info', true>;
    coverImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deals: Schema.Attribute.Relation<'oneToMany', 'api::deal.deal'>;
    description: Schema.Attribute.RichText;
    events: Schema.Attribute.Relation<'oneToMany', 'api::event.event'>;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    hours: Schema.Attribute.Component<'reusable.business-hours', true>;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::business.business'
    > &
      Schema.Attribute.Private;
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    notification_line_id: Schema.Attribute.String;
    notification_whatsapp_number: Schema.Attribute.String;
    owner: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    priceRange: Schema.Attribute.Enumeration<
      ['cheap', 'mid', 'good', 'premium']
    >;
    publishedAt: Schema.Attribute.DateTime;
    rating: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    reviewCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    reviews: Schema.Attribute.Relation<'oneToMany', 'api::review.review'>;
    seo: Schema.Attribute.Component<'reusable.seo-metadata', true>;
    slug: Schema.Attribute.UID & Schema.Attribute.Required;
    socialMedia: Schema.Attribute.Component<'reusable.social-media', true>;
    tags: Schema.Attribute.Component<'reusable.tags', true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface ApiCategoryCategory extends Struct.CollectionTypeSchema {
  collectionName: 'categories';
  info: {
    description: 'Organize your content into categories';
    displayName: 'Category';
    pluralName: 'categories';
    singularName: 'category';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    businesses: Schema.Attribute.Relation<
      'manyToMany',
      'api::business.business'
    >;
    color: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deals: Schema.Attribute.Relation<'oneToMany', 'api::deal.deal'>;
    description: Schema.Attribute.Text;
    events: Schema.Attribute.Relation<'oneToMany', 'api::event.event'>;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    icon: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::category.category'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    order: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiDealDeal extends Struct.CollectionTypeSchema {
  collectionName: 'deals';
  info: {
    displayName: 'Deal';
    pluralName: 'deals';
    singularName: 'deal';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    bookings: Schema.Attribute.Relation<'oneToMany', 'api::booking.booking'>;
    business: Schema.Attribute.Relation<'manyToOne', 'api::business.business'>;
    clicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    conversions: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deal_category: Schema.Attribute.Enumeration<
      ['Hotel', 'Activity', 'Food & Drink', 'Spa', 'Retail']
    > &
      Schema.Attribute.Required;
    deal_title: Schema.Attribute.String & Schema.Attribute.Required;
    deal_type: Schema.Attribute.Enumeration<['Standard', 'Flash']> &
      Schema.Attribute.DefaultTo<'Standard'>;
    description: Schema.Attribute.RichText;
    expiry_date_time: Schema.Attribute.DateTime & Schema.Attribute.Required;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image_gallery: Schema.Attribute.Media<'images', true>;
    is_featured_on_homepage: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    is_in_marquee: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::deal.deal'> &
      Schema.Attribute.Private;
    original_price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    quantity_remaining: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<0>;
    quantity_total: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    requires_reservation: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    sale_price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    seo: Schema.Attribute.Component<'reusable.seo-metadata', true>;
    slug: Schema.Attribute.UID & Schema.Attribute.Required;
    tags: Schema.Attribute.Component<'reusable.tags', true>;
    the_fine_print: Schema.Attribute.RichText;
    tiered_discounts: Schema.Attribute.Component<'deals.tiered-discount', true>;
    time_based_discounts: Schema.Attribute.Component<
      'deals.time-based-discount',
      true
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    views: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiEventCalendarEventCalendar
  extends Struct.CollectionTypeSchema {
  collectionName: 'event_calendars';
  info: {
    displayName: 'Event Calendar';
    pluralName: 'event-calendars';
    singularName: 'event-calendar';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Accessibility: Schema.Attribute.Text;
    AgeRestriction: Schema.Attribute.String;
    Attendees: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Category: Schema.Attribute.Enumeration<
      [
        'Music',
        'Sports',
        'Tourism',
        'Entertainment',
        'Nightlife',
        'Shopping',
        'Food',
        'Culture',
        'Business',
        'Education',
        'Health',
        'Technology',
      ]
    > &
      Schema.Attribute.Required;
    ContactEmail: Schema.Attribute.String;
    ContactPhone: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Date: Schema.Attribute.Date & Schema.Attribute.Required;
    Description: Schema.Attribute.Text;
    Duration: Schema.Attribute.String;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Image: Schema.Attribute.Media<'images'>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::event-calendar.event-calendar'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String & Schema.Attribute.Required;
    MaxAttendees: Schema.Attribute.Integer;
    Organizer: Schema.Attribute.String;
    Price: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    Status: Schema.Attribute.Enumeration<
      [
        'confirmed',
        'filling-fast',
        'sold-out',
        'free',
        'cancelled',
        'postponed',
      ]
    > &
      Schema.Attribute.DefaultTo<'confirmed'>;
    Tags: Schema.Attribute.JSON;
    Time: Schema.Attribute.Time & Schema.Attribute.Required;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Website: Schema.Attribute.String;
  };
}

export interface ApiEventEvent extends Struct.CollectionTypeSchema {
  collectionName: 'events';
  info: {
    displayName: 'Event';
    pluralName: 'events';
    singularName: 'event';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    business: Schema.Attribute.Relation<'manyToOne', 'api::business.business'>;
    capacity: Schema.Attribute.Integer;
    category: Schema.Attribute.Relation<'manyToOne', 'api::category.category'>;
    coverImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.RichText;
    endTime: Schema.Attribute.DateTime & Schema.Attribute.Required;
    eventStatus: Schema.Attribute.Enumeration<
      ['draft', 'published', 'cancelled', 'completed']
    >;
    eventType: Schema.Attribute.Enumeration<['in-person', 'virtual', 'hybrid']>;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::event.event'> &
      Schema.Attribute.Private;
    location: Schema.Attribute.Component<'reusable.location', true>;
    price: Schema.Attribute.Component<'reusable.pricing', true>;
    publishedAt: Schema.Attribute.DateTime;
    registeredAttendees: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<0>;
    registrationDeadline: Schema.Attribute.DateTime;
    registrationRequired: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    seo: Schema.Attribute.Component<'reusable.seo-metadata', true>;
    shortDescription: Schema.Attribute.Text;
    slug: Schema.Attribute.UID & Schema.Attribute.Required;
    startDate: Schema.Attribute.DateTime & Schema.Attribute.Required;
    tags: Schema.Attribute.Component<'reusable.tags', true>;
    timezone: Schema.Attribute.String;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    venue: Schema.Attribute.String;
  };
}

export interface ApiForumActivityForumActivity
  extends Struct.CollectionTypeSchema {
  collectionName: 'forum_activities';
  info: {
    displayName: 'Forum Activity';
    pluralName: 'forum-activities';
    singularName: 'forum-activity';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    AuthorAvatar: Schema.Attribute.Media<'images'>;
    AuthorName: Schema.Attribute.String & Schema.Attribute.Required;
    AuthorReputation: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Category: Schema.Attribute.Enumeration<
      [
        'Nightlife',
        'Visa & Legal',
        'Transportation',
        'Events',
        'Living',
        'Food & Dining',
        'Accommodation',
        'Shopping',
        'Health',
        'Entertainment',
        'Sports',
        'General',
      ]
    > &
      Schema.Attribute.Required;
    Content: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    IsHot: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    IsPinned: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    LastActivity: Schema.Attribute.DateTime & Schema.Attribute.Required;
    LastUpdated: Schema.Attribute.DateTime;
    Likes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::forum-activity.forum-activity'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    Replies: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Tags: Schema.Attribute.JSON;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    URL: Schema.Attribute.String;
    Views: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiGlobalSponsorshipGlobalSponsorship
  extends Struct.CollectionTypeSchema {
  collectionName: 'global_sponsorships';
  info: {
    description: 'Manage global sponsorship for homepage widgets';
    displayName: 'Global Sponsorship';
    pluralName: 'global-sponsorships';
    singularName: 'global-sponsorship';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::global-sponsorship.global-sponsorship'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sponsorColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#1e40af'>;
    sponsoredWidgets: Schema.Attribute.Enumeration<
      [
        'radio',
        'weather',
        'news',
        'events',
        'deals',
        'business',
        'social',
        'traffic',
        'youtube',
        'photos',
      ]
    >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGlobalGlobal extends Struct.SingleTypeSchema {
  collectionName: 'globals';
  info: {
    description: 'Define global settings';
    displayName: 'Global';
    pluralName: 'globals';
    singularName: 'global';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    defaultSeo: Schema.Attribute.Component<'shared.seo', false>;
    favicon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::global.global'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    siteDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    siteName: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGoogleReviewGoogleReview
  extends Struct.CollectionTypeSchema {
  collectionName: 'google_reviews';
  info: {
    displayName: 'Google Review';
    pluralName: 'google-reviews';
    singularName: 'google-review';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    AuthorName: Schema.Attribute.String & Schema.Attribute.Required;
    AuthorProfilePhotoUrl: Schema.Attribute.String;
    AuthorProfileUrl: Schema.Attribute.String;
    BusinessAddress: Schema.Attribute.String;
    BusinessName: Schema.Attribute.String & Schema.Attribute.Required;
    BusinessType: Schema.Attribute.String;
    BusinessUrl: Schema.Attribute.String;
    Category: Schema.Attribute.Enumeration<
      [
        'Restaurant',
        'Hotel',
        'Spa',
        'Shopping',
        'Entertainment',
        'Nightlife',
        'Tourism',
        'Transportation',
        'Health',
        'Other',
      ]
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Language: Schema.Attribute.String & Schema.Attribute.DefaultTo<'en'>;
    LastUpdated: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::google-review.google-review'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    Rating: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    RelativeTimeDescription: Schema.Attribute.String;
    ReviewText: Schema.Attribute.Text & Schema.Attribute.Required;
    ReviewTime: Schema.Attribute.DateTime & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface ApiLiveEventLiveEvent extends Struct.CollectionTypeSchema {
  collectionName: 'live_events';
  info: {
    displayName: 'Live Event';
    pluralName: 'live-events';
    singularName: 'live-event';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Attendees: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Category: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    EndTime: Schema.Attribute.DateTime;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Image: Schema.Attribute.Media<'images'>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::live-event.live-event'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String & Schema.Attribute.Required;
    Order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    StartTime: Schema.Attribute.DateTime;
    Status: Schema.Attribute.Enumeration<['live', 'starting', 'upcoming']> &
      Schema.Attribute.Required;
    Tags: Schema.Attribute.JSON;
    Time: Schema.Attribute.String & Schema.Attribute.Required;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNewsArticleNewsArticle extends Struct.CollectionTypeSchema {
  collectionName: 'news_articles';
  info: {
    displayName: 'News Article';
    pluralName: 'news-articles';
    singularName: 'news-article';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Content: Schema.Attribute.Blocks;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Culture: Schema.Attribute.Enumeration<
      ['Tourism', 'Culture', 'Environment', 'Business', 'Technology', 'Sports']
    > &
      Schema.Attribute.Required;
    Image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::news-article.news-article'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    PublishedTimestamp: Schema.Attribute.DateTime & Schema.Attribute.Required;
    Source: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Pattaya News'>;
    Summary: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    Trending: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    URL: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ApiNewsSettingsNewsSettings extends Struct.SingleTypeSchema {
  collectionName: 'news_settings';
  info: {
    description: 'Global settings for news fetching and moderation';
    displayName: 'News Settings';
    pluralName: 'news-settings-collection';
    singularName: 'news-settings';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    autoModerationEnabled: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    cronJobEnabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enableVoting: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    fetchIntervalMinutes: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 1440;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<30>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::news-settings.news-settings'
    > &
      Schema.Attribute.Private;
    maxArticlesPerFetch: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<20>;
    moderationKeywords: Schema.Attribute.JSON &
      Schema.Attribute.DefaultTo<
        ['spam', 'fake', 'clickbait', 'scam', 'adult', 'explicit']
      >;
    newsApiCategory: Schema.Attribute.Enumeration<
      [
        'business',
        'entertainment',
        'general',
        'health',
        'science',
        'sports',
        'technology',
      ]
    > &
      Schema.Attribute.DefaultTo<'general'>;
    newsApiCountry: Schema.Attribute.String & Schema.Attribute.DefaultTo<'us'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNewsSourceNewsSource extends Struct.CollectionTypeSchema {
  collectionName: 'news_sources';
  info: {
    description: 'Manage multiple news sources including RSS feeds, APIs, and social media';
    displayName: 'News Source';
    pluralName: 'news-sources';
    singularName: 'news-source';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    apiKey: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    fetchInterval: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 1440;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<30>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    keyValue: Schema.Attribute.Text;
    lastError: Schema.Attribute.Text;
    lastFetchedAt: Schema.Attribute.DateTime;
    lastFetchStatus: Schema.Attribute.Enumeration<
      ['success', 'error', 'pending']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::news-source.news-source'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    priority: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    publishedAt: Schema.Attribute.DateTime;
    rssUrl: Schema.Attribute.String;
    sourceType: Schema.Attribute.Enumeration<
      ['rss_feed', 'news_api', 'facebook_page', 'website_scraper']
    > &
      Schema.Attribute.Required;
    totalArticlesFetched: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ApiPhotoGalleryPhotoGallery
  extends Struct.CollectionTypeSchema {
  collectionName: 'photo_galleries';
  info: {
    displayName: 'Photo Gallery';
    pluralName: 'photo-galleries';
    singularName: 'photo-gallery';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Author: Schema.Attribute.String & Schema.Attribute.Required;
    CameraSettings: Schema.Attribute.JSON;
    Category: Schema.Attribute.Enumeration<
      [
        'Landscape',
        'Food',
        'Culture',
        'Nightlife',
        'Architecture',
        'People',
        'Nature',
        'Events',
        'Street',
        'Portrait',
        'Travel',
        'Other',
      ]
    > &
      Schema.Attribute.Required;
    Comments: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime;
    Likes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::photo-gallery.photo-gallery'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String & Schema.Attribute.Required;
    LocationCoordinates: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    Tags: Schema.Attribute.JSON;
    TimeAgo: Schema.Attribute.String;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Views: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiQuickLinkQuickLink extends Struct.CollectionTypeSchema {
  collectionName: 'quick_links';
  info: {
    displayName: 'Quick Link';
    pluralName: 'quick-links';
    singularName: 'quick-link';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Category: Schema.Attribute.Enumeration<
      ['main', 'travel', 'personal', 'social', 'info']
    > &
      Schema.Attribute.Required;
    Color: Schema.Attribute.String & Schema.Attribute.Required;
    Count: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    HoverColor: Schema.Attribute.String & Schema.Attribute.Required;
    Href: Schema.Attribute.String & Schema.Attribute.Required;
    Icon: Schema.Attribute.String & Schema.Attribute.Required;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::quick-link.quick-link'
    > &
      Schema.Attribute.Private;
    Order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    Tags: Schema.Attribute.JSON;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRadioStationRadioStation
  extends Struct.CollectionTypeSchema {
  collectionName: 'radio_stations';
  info: {
    displayName: 'Radio Station';
    pluralName: 'radio-stations';
    singularName: 'radio-station';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    AudioPreRollAd: Schema.Attribute.Media<'audios'>;
    CoverImage: Schema.Attribute.Media<'images' | 'files', true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    CurrentTrack: Schema.Attribute.String;
    Description: Schema.Attribute.Blocks;
    DisplayOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 999;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<999>;
    Facebook: Schema.Attribute.String;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Frequency: Schema.Attribute.String & Schema.Attribute.Required;
    Genre: Schema.Attribute.String;
    Instagram: Schema.Attribute.String;
    IsLive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    IsSponsored: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Listeners: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::radio-station.radio-station'
    > &
      Schema.Attribute.Private;
    Logo: Schema.Attribute.Media<'images'>;
    Name: Schema.Attribute.String & Schema.Attribute.Required;
    PreRollAdActive: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    PreRollAdDuration: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 15;
          min: 3;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    PreRollAdText: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    SponsoredLabel: Schema.Attribute.String;
    SponsoredUntil: Schema.Attribute.Date;
    StreamURL: Schema.Attribute.String & Schema.Attribute.Required;
    Twitter: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Website: Schema.Attribute.String;
  };
}

export interface ApiReviewReview extends Struct.CollectionTypeSchema {
  collectionName: 'reviews';
  info: {
    displayName: 'Review';
    pluralName: 'reviews';
    singularName: 'review';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    business: Schema.Attribute.Relation<'manyToOne', 'api::business.business'>;
    content: Schema.Attribute.RichText;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    helpful: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::review.review'
    > &
      Schema.Attribute.Private;
    notHelpful: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    reviewStatus: Schema.Attribute.Enumeration<
      ['pending', 'approved', 'rejected']
    >;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    verifiedPurchase: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    visitDate: Schema.Attribute.Date;
  };
}

export interface ApiSocialMediaPostSocialMediaPost
  extends Struct.CollectionTypeSchema {
  collectionName: 'social_media_posts';
  info: {
    displayName: 'Social Media Post';
    pluralName: 'social-media-posts';
    singularName: 'social-media-post';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Author: Schema.Attribute.String & Schema.Attribute.Required;
    Avatar: Schema.Attribute.Media<'images'>;
    Category: Schema.Attribute.Enumeration<
      [
        'Tourism',
        'Food',
        'Nightlife',
        'Culture',
        'Events',
        'Business',
        'Lifestyle',
      ]
    >;
    Comments: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Content: Schema.Attribute.Text & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Handle: Schema.Attribute.String & Schema.Attribute.Required;
    Hashtags: Schema.Attribute.JSON;
    Image: Schema.Attribute.Media<'images'>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Likes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::social-media-post.social-media-post'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String;
    Platform: Schema.Attribute.Enumeration<
      ['twitter', 'threads', 'instagram', 'bluesky', 'facebook', 'tiktok']
    > &
      Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    Shares: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Timestamp: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    URL: Schema.Attribute.String;
    Verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface ApiSponsoredPostSponsoredPost
  extends Struct.CollectionTypeSchema {
  collectionName: 'sponsored_posts';
  info: {
    description: 'Sponsored content for monetization';
    displayName: 'Sponsored Post';
    pluralName: 'sponsored-posts';
    singularName: 'sponsored-post';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Budget: Schema.Attribute.Decimal;
    CampaignEndDate: Schema.Attribute.DateTime;
    CampaignStartDate: Schema.Attribute.DateTime;
    ClickCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    CostPerClick: Schema.Attribute.Decimal;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    DisplayPosition: Schema.Attribute.Enumeration<
      ['top', 'position-3', 'position-5', 'bottom']
    > &
      Schema.Attribute.DefaultTo<'position-3'>;
    Image: Schema.Attribute.Media<'images'>;
    ImpressionCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sponsored-post.sponsored-post'
    > &
      Schema.Attribute.Private;
    Logo: Schema.Attribute.Media<'images'>;
    Priority: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    publishedAt: Schema.Attribute.DateTime;
    SourceBreakingNewsId: Schema.Attribute.Integer;
    SponsorLogo: Schema.Attribute.Media<'images'>;
    SponsorName: Schema.Attribute.String & Schema.Attribute.Required;
    Summary: Schema.Attribute.Text & Schema.Attribute.Required;
    TargetURL: Schema.Attribute.String & Schema.Attribute.Required;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTrafficIncidentTrafficIncident
  extends Struct.CollectionTypeSchema {
  collectionName: 'traffic_incidents';
  info: {
    displayName: 'Traffic Incident';
    pluralName: 'traffic-incidents';
    singularName: 'traffic-incident';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    AffectedRoutes: Schema.Attribute.JSON;
    Coordinates: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text & Schema.Attribute.Required;
    EstimatedClearTime: Schema.Attribute.String & Schema.Attribute.Required;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::traffic-incident.traffic-incident'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String & Schema.Attribute.Required;
    Order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    Severity: Schema.Attribute.Enumeration<['low', 'medium', 'high']> &
      Schema.Attribute.Required;
    Type: Schema.Attribute.Enumeration<
      ['accident', 'construction', 'event', 'weather']
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTrafficRouteTrafficRoute
  extends Struct.CollectionTypeSchema {
  collectionName: 'traffic_routes';
  info: {
    displayName: 'Traffic Route';
    pluralName: 'traffic-routes';
    singularName: 'traffic-route';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    CurrentTime: Schema.Attribute.String & Schema.Attribute.Required;
    Delay: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Description: Schema.Attribute.Text;
    Distance: Schema.Attribute.String & Schema.Attribute.Required;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    From: Schema.Attribute.String & Schema.Attribute.Required;
    Incidents: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::traffic-route.traffic-route'
    > &
      Schema.Attribute.Private;
    NormalTime: Schema.Attribute.String & Schema.Attribute.Required;
    Order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    Status: Schema.Attribute.Enumeration<
      ['clear', 'moderate', 'heavy', 'blocked']
    > &
      Schema.Attribute.Required;
    To: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTrendingTopicTrendingTopic
  extends Struct.CollectionTypeSchema {
  collectionName: 'trending_topics';
  info: {
    displayName: 'Trending Topic';
    pluralName: 'trending-topics';
    singularName: 'trending-topic';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Category: Schema.Attribute.Enumeration<
      [
        'Tourism',
        'Nightlife',
        'Events',
        'Shopping',
        'Culture',
        'Food',
        'Business',
        'Entertainment',
      ]
    > &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Growth: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    Icon: Schema.Attribute.String;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::trending-topic.trending-topic'
    > &
      Schema.Attribute.Private;
    Posts: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    Rank: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    Type: Schema.Attribute.Enumeration<
      ['hashtag', 'location', 'event', 'business', 'topic']
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    URL: Schema.Attribute.String;
  };
}

export interface ApiWeatherActivitySuggestionWeatherActivitySuggestion
  extends Struct.CollectionTypeSchema {
  collectionName: 'weather_activity_suggestions';
  info: {
    displayName: 'Weather Activity Suggestion';
    pluralName: 'weather-activity-suggestions';
    singularName: 'weather-activity-suggestion';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    link: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::weather-activity-suggestion.weather-activity-suggestion'
    > &
      Schema.Attribute.Private;
    priority: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    weatherCondition: Schema.Attribute.Enumeration<
      ['sunny', 'rainy', 'cloudy', 'thunderstorm', 'drizzle']
    >;
  };
}

export interface ApiWeatherCacheWeatherCache
  extends Struct.CollectionTypeSchema {
  collectionName: 'weather_caches';
  info: {
    displayName: 'Weather Cache';
    pluralName: 'weather-caches';
    singularName: 'weather-cache';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    latRounded: Schema.Attribute.Decimal & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::weather-cache.weather-cache'
    > &
      Schema.Attribute.Private;
    lonRounded: Schema.Attribute.Decimal & Schema.Attribute.Required;
    payload: Schema.Attribute.JSON & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    units: Schema.Attribute.Enumeration<['metric', 'imperial']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'metric'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiWeatherSettingWeatherSetting
  extends Struct.CollectionTypeSchema {
  collectionName: 'weather_settings';
  info: {
    displayName: 'Weather Setting';
    pluralName: 'weather-settings';
    singularName: 'weather-setting';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    defaultCityName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Pattaya City'>;
    defaultLatitude: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<12.9236>;
    defaultLongitude: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<100.8825>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::weather-setting.weather-setting'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sponsoredEnabled: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    sponsorLogo: Schema.Attribute.Media<'images'>;
    sponsorName: Schema.Attribute.String;
    units: Schema.Attribute.Enumeration<['metric', 'imperial']> &
      Schema.Attribute.DefaultTo<'metric'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    updateFrequencyMinutes: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<30>;
    widgetEnabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface ApiWeatherWeather extends Struct.CollectionTypeSchema {
  collectionName: 'weathers';
  info: {
    displayName: 'Weather';
    pluralName: 'weathers';
    singularName: 'weather';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Condition: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    FeelsLike: Schema.Attribute.Decimal;
    Humidity: Schema.Attribute.Integer;
    Icon: Schema.Attribute.String;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    LastUpdated: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::weather.weather'
    > &
      Schema.Attribute.Private;
    Location: Schema.Attribute.String;
    Pressure: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    Source: Schema.Attribute.String;
    Temperature: Schema.Attribute.Decimal;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    UvIndex: Schema.Attribute.Integer;
    Visibility: Schema.Attribute.Decimal;
    Windspeed: Schema.Attribute.Decimal;
  };
}

export interface ApiWidgetControlWidgetControl extends Struct.SingleTypeSchema {
  collectionName: 'widget_controls';
  info: {
    description: 'Controls for Breaking News widget display and behavior';
    displayName: 'Widget Control';
    pluralName: 'widget-controls';
    singularName: 'widget-control';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    EnableAutoRefresh: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::widget-control.widget-control'
    > &
      Schema.Attribute.Private;
    NumberOfArticles: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    publishedAt: Schema.Attribute.DateTime;
    ShowSourceNames: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    ShowTimestamps: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    ShowVotingButtons: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    UpdateFrequencyMinutes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 60;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    WidgetTheme: Schema.Attribute.Enumeration<['light', 'dark', 'auto']> &
      Schema.Attribute.DefaultTo<'light'>;
    WidgetTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Pattaya Breaking News'>;
  };
}

export interface ApiYoutubeVideoYoutubeVideo
  extends Struct.CollectionTypeSchema {
  collectionName: 'youtube_videos';
  info: {
    displayName: 'YouTube Video';
    pluralName: 'youtube-videos';
    singularName: 'youtube-video';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Category: Schema.Attribute.Enumeration<
      [
        'Travel',
        'Food',
        'Nightlife',
        'Culture',
        'Adventure',
        'Hotels',
        'Entertainment',
        'Sports',
      ]
    >;
    ChannelId: Schema.Attribute.String;
    ChannelName: Schema.Attribute.String & Schema.Attribute.Required;
    Comments: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    Dislikes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Duration: Schema.Attribute.String;
    Featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    IsActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Likes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::youtube-video.youtube-video'
    > &
      Schema.Attribute.Private;
    Promoted: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    publishedAt: Schema.Attribute.DateTime;
    Tags: Schema.Attribute.JSON;
    Thumbnail: Schema.Attribute.Media<'images'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    URL: Schema.Attribute.String;
    VideoId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    Views: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    bookings: Schema.Attribute.Relation<'oneToMany', 'api::booking.booking'>;
    businesses: Schema.Attribute.Relation<
      'oneToMany',
      'api::business.business'
    >;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    fcm_tokens: Schema.Attribute.JSON;
    firebaseUid: Schema.Attribute.String & Schema.Attribute.Unique;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    notification_preferences: Schema.Attribute.JSON &
      Schema.Attribute.DefaultTo<{
        email: true;
        push: true;
        sms: false;
      }>;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::about.about': ApiAboutAbout;
      'api::advertisement.advertisement': ApiAdvertisementAdvertisement;
      'api::author.author': ApiAuthorAuthor;
      'api::booking.booking': ApiBookingBooking;
      'api::breaking-news.breaking-news': ApiBreakingNewsBreakingNews;
      'api::business-spotlight.business-spotlight': ApiBusinessSpotlightBusinessSpotlight;
      'api::business.business': ApiBusinessBusiness;
      'api::category.category': ApiCategoryCategory;
      'api::deal.deal': ApiDealDeal;
      'api::event-calendar.event-calendar': ApiEventCalendarEventCalendar;
      'api::event.event': ApiEventEvent;
      'api::forum-activity.forum-activity': ApiForumActivityForumActivity;
      'api::global-sponsorship.global-sponsorship': ApiGlobalSponsorshipGlobalSponsorship;
      'api::global.global': ApiGlobalGlobal;
      'api::google-review.google-review': ApiGoogleReviewGoogleReview;
      'api::live-event.live-event': ApiLiveEventLiveEvent;
      'api::news-article.news-article': ApiNewsArticleNewsArticle;
      'api::news-settings.news-settings': ApiNewsSettingsNewsSettings;
      'api::news-source.news-source': ApiNewsSourceNewsSource;
      'api::photo-gallery.photo-gallery': ApiPhotoGalleryPhotoGallery;
      'api::quick-link.quick-link': ApiQuickLinkQuickLink;
      'api::radio-station.radio-station': ApiRadioStationRadioStation;
      'api::review.review': ApiReviewReview;
      'api::social-media-post.social-media-post': ApiSocialMediaPostSocialMediaPost;
      'api::sponsored-post.sponsored-post': ApiSponsoredPostSponsoredPost;
      'api::traffic-incident.traffic-incident': ApiTrafficIncidentTrafficIncident;
      'api::traffic-route.traffic-route': ApiTrafficRouteTrafficRoute;
      'api::trending-topic.trending-topic': ApiTrendingTopicTrendingTopic;
      'api::weather-activity-suggestion.weather-activity-suggestion': ApiWeatherActivitySuggestionWeatherActivitySuggestion;
      'api::weather-cache.weather-cache': ApiWeatherCacheWeatherCache;
      'api::weather-setting.weather-setting': ApiWeatherSettingWeatherSetting;
      'api::weather.weather': ApiWeatherWeather;
      'api::widget-control.widget-control': ApiWidgetControlWidgetControl;
      'api::youtube-video.youtube-video': ApiYoutubeVideoYoutubeVideo;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
