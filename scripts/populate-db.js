// scripts/populate-db.js
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

// Carga las variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables de entorno de Supabase no configuradas.');
}
const supabase = createClient(supabaseUrl, supabaseKey);

const anilistApiUrl = 'https://graphql.anilist.co';

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});
const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_R2_COVERS_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_COVERS_PUBLIC_URL;

const fullMediaQuery = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    media(type: MANGA, sort: POPULARITY_DESC) {
      id
      idMal
      title { romaji english native userPreferred }
      type
      format
      status
      description(asHtml: false)
      startDate { year month day }
      endDate { year month day }
      season
      seasonYear
      episodes
      duration
      chapters
      countryOfOrigin
      source
      hashtag
      trailer { id site thumbnail }
      coverImage { extraLarge large color }
      bannerImage
      genres
      synonyms
      averageScore
      meanScore
      popularity
      isAdult
      siteUrl
      tags { id name description category isGeneralSpoiler rank }
      relations { edges { relationType node { id title { romaji english } type format } } }
      characters(sort: ROLE, perPage: 6) { edges { role node { id name { full } image { large } } } }
      staff(sort: RELEVANCE, perPage: 6) { edges { role node { id name { full } image { large } } } }
    }
  }
}
`;

async function fetchPage(page) {
    console.log(`Fetching page ${page}...`);
    const response = await fetch(anilistApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            query: fullMediaQuery,
            variables: { page: page, perPage: 50 }
        })
    });
    if (!response.ok) throw new Error(`AniList API responded with status ${response.status}`);
    const { data } = await response.json();
    return data.Page;
}

async function checkAndUploadImage(anilistUrl, mediaId, type) {
  if (!anilistUrl) return null;

  const key = `manga-covers/${mediaId}-${type}.${anilistUrl.split('.').pop()}`;
  const r2Url = `${R2_PUBLIC_URL}/${key}`;

  try {
    await R2.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    
    const { data: dbData, error } = await supabase.from('media').select(`${type === 'large' ? 'cover_image_large' : 'cover_image_extra_large'}`).eq('id', mediaId).single();
    if (!error && dbData && (dbData.cover_image_large === r2Url || dbData.cover_image_extra_large === r2Url)) {
      console.log(`Imagen ${key} ya existe y está actualizada. Se omite.`);
      return r2Url;
    }

    console.log(`Imagen ${key} existe, pero la URL de la base de datos no coincide. Actualizando...`);
  } catch (error) {
    if (error.name === 'NotFound') {
      console.log(`Imagen ${key} no encontrada en R2. Descargando y subiendo...`);
    } else {
      console.error(`Error al verificar imagen ${key}:`, error);
      return anilistUrl;
    }
  }

  try {
    const response = await fetch(anilistUrl);
    if (!response.ok) {
      console.error(`Failed to download image from ${anilistUrl}: ${response.statusText}`);
      return anilistUrl;
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    await R2.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    console.log(`Imagen ${key} subida con éxito.`);
    return r2Url;
  } catch (error) {
    console.error(`Error uploading image to R2:`, error);
    return anilistUrl;
  }
}

async function populateDatabase() {
    let page = 1;
    let hasNextPage = true;
    let totalInserted = 0;
    const MAX_PAGES = 100;

    while (hasNextPage && page <= MAX_PAGES) {
        try {
            const pageData = await fetchPage(page);
            if (!pageData || !pageData.media) {
                console.log(`No media data on page ${page}. Stopping.`);
                break;
            }

            const mediaList = pageData.media;

            const formattedMedia = await Promise.all(mediaList.map(async m => {
                const newLargeUrl = await checkAndUploadImage(m.coverImage?.large, m.id, 'large');
                const newExtraLargeUrl = await checkAndUploadImage(m.coverImage?.extraLarge, m.id, 'extraLarge');
                
                return {
                    id: m.id,
                    mal_id: m.idMal,
                    title_romaji: m.title.romaji,
                    title_english: m.title.english,
                    title_native: m.title.native,
                    type: m.type,
                    format: m.format,
                    status: m.status,
                    description_en: m.description,
                    start_date: m.startDate,
                    end_date: m.endDate,
                    season: m.season,
                    season_year: m.seasonYear,
                    episodes: m.episodes,
                    duration: m.duration,
                    chapters: m.chapters,
                    country_of_origin: m.countryOfOrigin,
                    source: m.source,
                    hashtag: m.hashtag,
                    trailer: m.trailer,
                    cover_image_extra_large: newExtraLargeUrl,
                    cover_image_large: newLargeUrl,
                    cover_image_color: m.coverImage?.color,
                    banner_image: m.bannerImage,
                    genres: m.genres,
                    synonyms: m.synonyms,
                    average_score: m.averageScore,
                    mean_score: m.meanScore,
                    popularity: m.popularity,
                    is_adult: m.isAdult,
                    anilist_url: m.siteUrl,
                    tags: m.tags,
                    relations: m.relations,
                    characters: m.characters,
                    staff: m.staff,
                };
            }));

            const { error } = await supabase.from('media').upsert(formattedMedia, { onConflict: 'id' });

            if (error) {
                console.error(`Error inserting page ${page}:`, error);
                break;
            }

            totalInserted += formattedMedia.length;
            console.log(`Successfully inserted ${formattedMedia.length} records. Total: ${totalInserted}`);
            
            hasNextPage = pageData.pageInfo.hasNextPage;
            page++;

            await new Promise(res => setTimeout(res, 1500)); 
        } catch (e) {
            console.error(`Failed to process page ${page}:`, e.message);
            console.log("Waiting for 10 seconds before retrying...");
            await new Promise(res => setTimeout(res, 10000));
        }
    }

    console.log('Database population complete!');
}

populateDatabase();