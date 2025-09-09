// scripts/populate-db.js
const { createClient } = require('@supabase/supabase-js');

// Carga las variables de entorno
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Usa la clave de administrador
const supabase = createClient(supabaseUrl, supabaseKey);

const anilistApiUrl = 'https://graphql.anilist.co';

// Consulta GraphQL exhaustiva para obtener todos los campos posibles
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

async function populateDatabase() {
    let page = 1;
    let hasNextPage = true;
    let totalInserted = 0;
    const MAX_PAGES = 100; // Aumentamos para obtener hasta 5000 mangas

    while (hasNextPage && page <= MAX_PAGES) {
        try {
            const pageData = await fetchPage(page);
            if (!pageData || !pageData.media) {
                console.log(`No media data on page ${page}. Stopping.`);
                break;
            }

            const mediaList = pageData.media;

            // Mapea los datos de la API a las columnas de tu tabla
            const formattedMedia = mediaList.map(m => ({
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
                cover_image_extra_large: m.coverImage?.extraLarge,
                cover_image_large: m.coverImage?.large,
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

            // Esperar 1.5 segundos entre cada página para ser respetuosos con la API de AniList
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