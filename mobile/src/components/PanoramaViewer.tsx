import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { File, Paths } from "expo-file-system";

const { width, height } = Dimensions.get("window");

export default function PanoramaViewer({
  imageSource,
  style,
  onLoad,
}: {
  imageSource: string;
  style?: any;
  onLoad?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
  const [previousCachedUri, setPreviousCachedUri] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Cache image and manage blur
  useEffect(() => {
    let mounted = true;
    
    const cacheImage = async () => {
      try {
        console.log("Caching image:", imageSource);
        const filename = imageSource.split("/").pop() || "panorama.jpg";
        const cacheFile = new File(Paths.cache, filename);
        
        // Check if already cached
        const fileInfo = await cacheFile.info();
        
        if (fileInfo.exists) {
          console.log("Image already cached:", cacheFile.uri);
          if (mounted) {
            // Save previous for blur
            setPreviousCachedUri(cachedImageUri);
            setCachedImageUri(cacheFile.uri);
            return;
          }
        }
        
        // Download image
        console.log("Downloading image...");
        const response = await fetch(imageSource);
        const blob = await response.blob();
        
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });
        
        const writer = cacheFile.writableStream().getWriter();
        await writer.write(new Uint8Array(arrayBuffer));
        await writer.close();
        
        if (mounted) {
          console.log("Image cached:", cacheFile.uri);
          setPreviousCachedUri(cachedImageUri);
          setCachedImageUri(cacheFile.uri);
        }
      } catch (error) {
        console.error("Error caching image:", error);
        if (mounted) {
          // If caching fails, use URL directly
          setPreviousCachedUri(cachedImageUri);
          setCachedImageUri(imageSource);
        }
      }
    };

    cacheImage();

    return () => {
      mounted = false;
    };
  }, [imageSource]);

  console.log("PanoramaViewer - imageSource:", imageSource);

  // HTML content for Pannellum
  const htmlContent = useMemo(() => {
    if (!cachedImageUri) {
      console.log("No cached image yet");
      return "";
    }
    
    console.log("=== Generating Pannellum HTML ===");
    console.log("Cached image URI:", cachedImageUri);
    console.log("Original URL:", imageSource);
    
    // Pannellum needs the remote URL, not local file path
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=${width}, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
          #panorama {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div id="panorama"></div>
        
        <script>
          try {
            var viewer = pannellum.viewer('panorama', {
              type: 'equirectangular',
              panorama: '${imageSource}',
              autoLoad: true,
              showControls: false,
              showZoomCtrl: false,
              compass: false
            });
            
            viewer.on('load', function() {
              console.log('✓ Pannellum loaded successfully');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'loaded',
                success: true
              }));
            });
            
            viewer.on('error', function(error) {
              console.error('✗ Pannellum error:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: error.message || error.toString() || 'Unknown Pannellum error'
              }));
            });
            
            viewer.on('ierror', function() {
              console.error('✗ Image loading error');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Failed to load panorama image'
              }));
            });
            
          } catch (error) {
            console.error('✗ Initialization error:', error);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Init: ' + error.message
            }));
          }
        </script>
      </body>
      </html>
    `;
  }, [cachedImageUri]);

  // Handle messages from WebView
  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("WebView message:", data);
      
      if (data.type === 'loaded') {
        console.log("✓ Panorama loaded successfully");
        onLoad?.();
      } else if (data.type === 'error') {
        console.error("✗ Panorama error:", data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }, [onLoad]);

  // Handle WebView errors
  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    setErrorMessage(`WebView error: ${nativeEvent.description || nativeEvent.message || 'Unknown'}`);
    setIsLoading(false);
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* Blur background from previous image */}
      {isLoading && previousCachedUri && (
        <Image
          source={{ uri: previousCachedUri }}
          style={styles.blurBackground}
          blurRadius={20}
        />
      )}

      {/* WebView with new panorama */}
      {cachedImageUri && (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={styles.webView}
          onMessage={handleMessage}
          onError={handleWebViewError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
        />
      )}

      {/* Error overlay */}
      {!!errorMessage && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Ошибка загрузки</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  webView: {
    flex: 1,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  errorTitle: {
    color: "#FCA5A5",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorText: {
    color: "#E2E8F0",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
