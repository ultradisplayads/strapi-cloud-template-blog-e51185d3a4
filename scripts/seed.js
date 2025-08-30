'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

// Load data dynamically to avoid TypeScript issues
let categories, authors, articles, global, about, breakingNews, advertisements, weathers, radioStations, deals, newsArticles, youtubeVideos, socialMediaPosts, trendingTopics, businessSpotlights, googleReviews, eventCalendars, forumActivities, photoGalleries, quickLinks, trafficRoutes, trafficIncidents, liveEvents;
try {
  const data = require('../data/data.json');
  categories = data.categories;
  authors = data.authors;
  articles = data.articles;
  global = data.global;
  about = data.about;
  breakingNews = data['breaking-news'];
  advertisements = data.advertisements;
  weathers = data.weathers;
  radioStations = data['radio-stations'];
  deals = data.deals;
  newsArticles = data['news-articles'];
  youtubeVideos = data['youtube-videos'];
  socialMediaPosts = data['social-media-posts'];
  trendingTopics = data['trending-topics'];
  businessSpotlights = data['business-spotlights'];
  googleReviews = data['google-reviews'];
  eventCalendars = data['event-calendars'];
  forumActivities = data['forum-activities'];
  photoGalleries = data['photo-galleries'];
  quickLinks = data['quick-links'];
  trafficRoutes = data['traffic-routes'];
  trafficIncidents = data['traffic-incidents'];
  liveEvents = data['live-events'];
} catch (error) {
  console.error('Error loading data.json:', error);
  process.exit(1);
}

async function seedExampleApp() {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up the template...');
      await importSeedData();
      console.log('Ready to go');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log(
      'Seed data has already been imported. We cannot reimport unless you clear your database first.'
    );
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  };
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry }) {
  try {
    // Actually create the entry in Strapi
    // @ts-ignore
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function checkFileExistsBeforeUpload(files) {
  const existingFiles = [];
  const uploadedFiles = [];
  const filesCopy = [...files];

  for (const fileName of filesCopy) {
    // Check if the file already exists in Strapi
    const fileWhereName = await strapi.query('plugin::upload.file').findOne({
      where: {
        name: fileName.replace(/\..*$/, ''),
      },
    });

    if (fileWhereName) {
      // File exists, don't upload it
      existingFiles.push(fileWhereName);
    } else {
      // File doesn't exist, upload it
      const fileData = getFileData(fileName);
      const fileNameNoExtension = fileName.split('.').shift();
      const [file] = await uploadFile(fileData, fileNameNoExtension);
      uploadedFiles.push(file);
    }
  }
  const allFiles = [...existingFiles, ...uploadedFiles];
  // If only one file then return only that file
  return allFiles.length === 1 ? allFiles[0] : allFiles;
}

async function updateBlocks(blocks) {
  const updatedBlocks = [];
  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file name on the block with the actual file
      blockCopy.file = uploadedFiles;
      updatedBlocks.push(blockCopy);
    } else if (block.__component === 'shared.slider') {
      // Get files already uploaded to Strapi or upload new files
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(block.files);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file names on the block with the actual files
      blockCopy.files = existingAndUploadedFiles;
      // Push the updated block
      updatedBlocks.push(blockCopy);
    } else {
      // Just push the block as is
      updatedBlocks.push(block);
    }
  }

  return updatedBlocks;
}

async function importArticles() {
  for (const article of articles) {
    const cover = await checkFileExistsBeforeUpload([`${article.slug}.jpg`]);
    const updatedBlocks = await updateBlocks(article.blocks);

    await createEntry({
      model: 'article',
      entry: {
        ...article,
        cover,
        blocks: updatedBlocks,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importGlobal() {
  const favicon = await checkFileExistsBeforeUpload(['favicon.png']);
  const shareImage = await checkFileExistsBeforeUpload(['default-image.png']);
  return createEntry({
    model: 'global',
    entry: {
      ...global,
      favicon,
      // Make sure it's not a draft
      publishedAt: Date.now(),
      defaultSeo: {
        ...global.defaultSeo,
        shareImage,
      },
    },
  });
}

async function importAbout() {
  const updatedBlocks = await updateBlocks(about.blocks);

  await createEntry({
    model: 'about',
    entry: {
      ...about,
      blocks: updatedBlocks,
      // Make sure it's not a draft
      publishedAt: Date.now(),
    },
  });
}

async function importCategories() {
  for (const category of categories) {
    await createEntry({ model: 'category', entry: category });
  }
}

async function importAuthors() {
  for (const author of authors) {
    const avatar = await checkFileExistsBeforeUpload([author.avatar]);

    await createEntry({
      model: 'author',
      entry: {
        ...author,
        avatar,
      },
    });
  }
}

async function importBreakingNews() {
  for (const news of breakingNews) {
    await createEntry({
      model: 'breaking-news',
      entry: {
        ...news,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importAdvertisements() {
  for (const ad of advertisements) {
    await createEntry({
      model: 'advertisement',
      entry: {
        ...ad,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importWeathers() {
  for (const weather of weathers) {
    await createEntry({
      model: 'weather',
      entry: {
        ...weather,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importRadioStations() {
  for (const station of radioStations) {
    await createEntry({
      model: 'radio-station',
      entry: {
        ...station,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importDeals() {
  for (const deal of deals) {
    await createEntry({
      model: 'deal',
      entry: {
        ...deal,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importNewsArticles() {
  for (const article of newsArticles) {
    await createEntry({
      model: 'news-article',
      entry: {
        ...article,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importYouTubeVideos() {
  for (const video of youtubeVideos) {
    await createEntry({
      model: 'youtube-video',
      entry: {
        ...video,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importSocialMediaPosts() {
  for (const post of socialMediaPosts) {
    await createEntry({
      model: 'social-media-post',
      entry: {
        ...post,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importTrendingTopics() {
  for (const topic of trendingTopics) {
    await createEntry({
      model: 'trending-topic',
      entry: {
        ...topic,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importBusinessSpotlights() {
  for (const business of businessSpotlights) {
    await createEntry({
      model: 'business-spotlight',
      entry: {
        ...business,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importGoogleReviews() {
  for (const review of googleReviews) {
    await createEntry({
      model: 'google-review',
      entry: {
        ...review,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importEventCalendars() {
  for (const event of eventCalendars) {
    await createEntry({
      model: 'event-calendar',
      entry: {
        ...event,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importForumActivities() {
  for (const activity of forumActivities) {
    await createEntry({
      model: 'forum-activity',
      entry: {
        ...activity,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importPhotoGalleries() {
  for (const photo of photoGalleries) {
    await createEntry({
      model: 'photo-gallery',
      entry: {
        ...photo,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importQuickLinks() {
  for (const link of quickLinks) {
    await createEntry({
      model: 'quick-link',
      entry: {
        ...link,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importTrafficRoutes() {
  for (const route of trafficRoutes) {
    await createEntry({
      model: 'traffic-route',
      entry: {
        ...route,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importTrafficIncidents() {
  for (const incident of trafficIncidents) {
    await createEntry({
      model: 'traffic-incident',
      entry: {
        ...incident,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importLiveEvents() {
  for (const event of liveEvents) {
    await createEntry({
      model: 'live-event',
      entry: {
        ...event,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    author: ['find', 'findOne'],
    global: ['find', 'findOne'],
    about: ['find', 'findOne'],
    'breaking-news': ['find', 'findOne'],
    advertisement: ['find', 'findOne'],
    weather: ['find', 'findOne'],
    'radio-station': ['find', 'findOne'],
    deal: ['find', 'findOne'],
    'news-article': ['find', 'findOne'],
    'youtube-video': ['find', 'findOne'],
    'social-media-post': ['find', 'findOne'],
    'trending-topic': ['find', 'findOne'],
    'business-spotlight': ['find', 'findOne'],
    'google-review': ['find', 'findOne'],
    'event-calendar': ['find', 'findOne'],
    'forum-activity': ['find', 'findOne'],
    'photo-gallery': ['find', 'findOne'],
    'quick-link': ['find', 'findOne'],
    'traffic-route': ['find', 'findOne'],
    'traffic-incident': ['find', 'findOne'],
    'live-event': ['find', 'findOne'],
  });

  // Create all entries
  await importCategories();
  await importAuthors();
  await importArticles();
  await importGlobal();
  await importAbout();
  await importBreakingNews();
  await importAdvertisements();
  await importWeathers();
  await importRadioStations();
  await importDeals();
  await importNewsArticles();
  await importYouTubeVideos();
  await importSocialMediaPosts();
  await importTrendingTopics();
  await importBusinessSpotlights();
  await importGoogleReviews();
  await importEventCalendars();
  await importForumActivities();
  await importPhotoGalleries();
  await importQuickLinks();
  await importTrafficRoutes();
  await importTrafficIncidents();
  await importLiveEvents();
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedExampleApp();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
