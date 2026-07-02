#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use m3u8_rs::{MasterPlaylist, MediaPlaylist, Playlist};
use napi::bindgen_prelude::*;
use napi::JsString;
use url::Url;

#[napi(object)]
pub struct MediaSegment {
    pub uri: String,
    pub duration: f64,
}

#[napi]
pub struct HlsParser {
    stream_info_url: String,
}

#[napi]
impl HlsParser {
    #[napi(constructor)]
    pub fn new(stream_info_url: String) -> Self {
        Self { stream_info_url }
    }

    #[napi]
    pub fn handle_hls_playlist(
        &self,
        env: Env,
        playlist_content: String,
        create_internal_stream: JsFunction,
    ) -> Result<String> {
        // parse the raw hls text
        match m3u8_rs::parse_playlist_res(playlist_content.as_bytes()) {
            Ok(Playlist::MasterPlaylist(mut master)) => {
                self.transform_master_playlist(&env, &mut master, &create_internal_stream)?;
                let mut buf = Vec::new();
                master.write_to(&mut buf).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
                Ok(String::from_utf8(buf).unwrap())
            }
            Ok(Playlist::MediaPlaylist(mut media)) => {
                self.transform_media_playlist(&env, &mut media, &create_internal_stream)?;
                let mut buf = Vec::new();
                media.write_to(&mut buf).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
                Ok(String::from_utf8(buf).unwrap())
            }
            Err(e) => {
                Err(Error::new(Status::InvalidArg, format!("failed to parse hls: {:?}", e)))
            }
        }
    }

    #[napi]
    pub fn get_media_segments(&self, playlist_content: String) -> Result<Vec<MediaSegment>> {
        match m3u8_rs::parse_playlist_res(playlist_content.as_bytes()) {
            Ok(Playlist::MediaPlaylist(media)) => {
                let segments = media.segments.into_iter().map(|s| MediaSegment {
                    uri: s.uri,
                    duration: s.duration as f64,
                }).collect();
                Ok(segments)
            }
            Ok(Playlist::MasterPlaylist(_)) => {
                Err(Error::new(Status::InvalidArg, "expected media playlist, got master".to_string()))
            }
            Err(e) => {
                Err(Error::new(Status::InvalidArg, format!("failed to parse hls: {:?}", e)))
            }
        }
    }

    fn resolve_url(&self, uri: &str) -> Option<Url> {
        if let Ok(full_url) = Url::parse(uri) {
            Some(full_url)
        } else if let Ok(base_url) = Url::parse(&self.stream_info_url) {
            base_url.join(uri).ok()
        } else {
            None
        }
    }

    fn transform_uri(
        &self,
        env: &Env,
        uri: &mut String,
        create_internal_stream: &JsFunction,
    ) -> Result<()> {
        if let Some(full_url) = self.resolve_url(uri) {
            if full_url.host_str() != Some("127.0.0.1") {
                // call back into node to create the internal stream
                let js_string = env.create_string(&full_url.to_string())?;
                let result: JsString = create_internal_stream.call(None, &[js_string])?.try_into()?;
                *uri = result.into_utf8()?.into_owned()?;
            }
        }
        Ok(())
    }

    fn transform_master_playlist(
        &self,
        env: &Env,
        master: &mut MasterPlaylist,
        create_internal_stream: &JsFunction,
    ) -> Result<()> {
        for variant in &mut master.variants {
            self.transform_uri(env, &mut variant.uri, create_internal_stream)?;
        }
        Ok(())
    }

    fn transform_media_playlist(
        &self,
        env: &Env,
        media: &mut MediaPlaylist,
        create_internal_stream: &JsFunction,
    ) -> Result<()> {
        for segment in &mut media.segments {
            self.transform_uri(env, &mut segment.uri, create_internal_stream)?;
        }
        Ok(())
    }
}
