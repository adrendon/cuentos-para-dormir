#!/usr/bin/env python3
"""
Descarga todos los libros de Little Stories (contenido + audio en español)
"""
import json, urllib.request, urllib.parse, os, subprocess, sys

BASE_CONTENT = "https://lsandroidbookscontent-ete4d8bmbsg4f0a4.z02.azurefd.net/"
BASE_VOICE = "https://lsandroidvoicework-f3a7buczbzh2d8gd.z02.azurefd.net/"
ZIP_PASSWORD = "6EvQP9p!CA#Hgg-CHuLcyTQXH"
OUTPUT_DIR = "/Users/alexis/Downloads/jadx/books"
BUNDLE_ID = "com.diveomedia.little.stories.bedtime.books.kids"
APP_VERSION = "5.5.6"

def get_all_books():
    """Combinar los 92 libros embebidos con las novedades publicadas por la API."""
    # El APK contiene la base histórica; la API puede añadir libros nuevos.
    descriptions_path = "/Users/alexis/Downloads/jadx/out-jadx/resources/assets/BooksDescriptions.json"
    sizes_path = "/Users/alexis/Downloads/jadx/out-jadx/resources/assets/BooksDownloadSizes.json"
    
    with open(descriptions_path) as f:
        descriptions = json.load(f)
    
    with open(sizes_path) as f:
        sizes_data = json.load(f)
    
    # También obtener info de la API (tiene textos y metadatos extra)
    api_books = {}
    url = "https://api.diveomedia.com/booksStorage"
    req = urllib.request.Request(url)
    req.add_header("bundleId", BUNDLE_ID)
    req.add_header("AppVersion", APP_VERSION)
    try:
        last_book_id = None
        while True:
            page_url = url
            if last_book_id:
                page_url += "?" + urllib.parse.urlencode({"last_book_id": last_book_id})
            page_req = urllib.request.Request(page_url)
            page_req.add_header("bundleId", BUNDLE_ID)
            page_req.add_header("AppVersion", APP_VERSION)
            with urllib.request.urlopen(page_req) as resp:
                data = json.loads(resp.read())
            page_books = data.get("books", [])
            new_books = [b for b in page_books if b["bookFolderName"] not in api_books]
            for b in new_books:
                api_books[b["bookFolderName"]] = b
            if not page_books or not new_books:
                break
            last_book_id = page_books[-1]["id"]
    except:
        pass
    
    # Combinar info
    all_books = []
    for desc in descriptions:
        folder = desc.get("folderName", "")
        product_id = desc.get("productId", "")
        
        # Buscar sizes para este libro
        book_sizes = sizes_data.get(product_id, {})
        
        # Buscar info de API si existe
        api_info = api_books.get(folder, {})
        
        book = {
            "bookFolderName": folder,
            "id": product_id,
            "numberOfPages": desc.get("numberOfPages", 0),
            "type": desc.get("type", "purchase"),
            "downloadSizes": book_sizes or api_info.get("downloadSizes", {}),
            "texts": api_info.get("texts", {}),
            "voiceworks": api_info.get("voiceworks", []),
        }
        all_books.append(book)

    # Añadir libros publicados por la API que aún no estén en el APK.
    for folder, api_info in api_books.items():
        if folder in {book["bookFolderName"] for book in all_books}:
            continue
        all_books.append({
            "bookFolderName": folder,
            "id": api_info["id"],
            "numberOfPages": api_info.get("declaredNumberOfPages", 0),
            "type": "purchase",
            "downloadSizes": api_info.get("downloadSizes", {}),
            "texts": api_info.get("texts", {}),
            "voiceworks": api_info.get("voiceworks", []),
        })
    
    return all_books

def build_voice_archive_name(child_name, child_gender, language_code, narrator, book_folder):
    """Replica VoiceWorkArchiveNameBuilder.build()"""
    hex_part = (child_name + "_" + narrator).encode("utf-8").hex().upper()
    return f"{book_folder}_{language_code}_{child_gender}_{hex_part}.compressed"

def download_file(url, dest):
    """Descarga un archivo, retorna True si exitoso"""
    try:
        urllib.request.urlretrieve(url, dest)
        if os.path.getsize(dest) > 500:
            return True
        os.remove(dest)
        return False
    except:
        if os.path.exists(dest):
            os.remove(dest)
        return False

def main():
    print("=== Little Stories Downloader (Solo Español) ===\n")
    
    # 1. Obtener catálogo
    print("Obteniendo catálogo...")
    all_books = get_all_books()
    print(f"\nTotal libros únicos: {len(all_books)}\n")
    
    # Guardar catálogo
    with open(os.path.join(OUTPUT_DIR, "catalog_complete.json"), "w") as f:
        json.dump(all_books, f, indent=2, ensure_ascii=False)
    
    # 2. Descargar cada libro
    for i, book in enumerate(all_books, 1):
        folder = book["bookFolderName"]
        title_es = book.get("texts", {}).get("es", {}).get("title", folder)
        book_dir = os.path.join(OUTPUT_DIR, folder)
        
        print(f"\n[{i}/{len(all_books)}] {title_es} ({folder})")
        
        # --- CONTENIDO (páginas/imágenes) ---
        if os.path.isdir(book_dir) and any(f.endswith(('.webp','.jpg','.mp3','.csv')) for f in os.listdir(book_dir)):
            print(f"  ✓ Contenido ya descargado")
        else:
            sizes = book.get("downloadSizes", {})
            resolution = None
            for res in ["Unknown_h1080xr1610_webp", "Unknown_h720xr1610_webp", "Unknown_h540xr1610_webp", 
                       "Unknown_h1080xr2110_webp", "Unknown_2560x1600_webp", "Unknown_2560x1600_jpeg",
                       "Unknown_h1080xr1610_jpeg"]:
                if res in sizes:
                    resolution = res.replace("Unknown_", "")
                    break
            
            if not resolution and sizes:
                resolution = list(sizes.keys())[0].replace("Unknown_", "")
            
            if resolution:
                zip_url = f"{BASE_CONTENT}{folder}_{resolution}.zip"
                zip_path = os.path.join(OUTPUT_DIR, f"{folder}_content.zip")
                
                print(f"  Descargando contenido ({resolution})...", end=" ", flush=True)
                if download_file(zip_url, zip_path):
                    os.makedirs(book_dir, exist_ok=True)
                    subprocess.run(["unzip", "-P", ZIP_PASSWORD, "-o", zip_path, "-d", book_dir],
                                  capture_output=True)
                    os.remove(zip_path)
                    print("✓")
                else:
                    print("✗ (no disponible)")
            else:
                print("  - Sin resolución disponible")
        
        # --- AUDIO EN ESPAÑOL (voiceworks) ---
        voiceworks = book.get("voiceworks", [])
        es_voices = [v for v in voiceworks if v.get("languageCode") == "es"]
        
        for vw in es_voices:
            child_name = vw.get("childName", "")
            child_gender = vw.get("childGender", "boy")
            narrator = vw.get("narrator", "")
            
            voice_dir = os.path.join(book_dir, "voicework_es")
            
            # Verificar si ya existe
            if os.path.isdir(voice_dir) and os.listdir(voice_dir):
                print(f"  ✓ Audio ES ya descargado")
                continue
            
            # Construir nombre del archivo: build() retorna "...compressed", luego se agrega ".zip"
            archive_name = build_voice_archive_name(child_name, child_gender, "es", narrator, folder)
            voice_url = f"{BASE_VOICE}{archive_name}.zip"
            vzip = os.path.join(OUTPUT_DIR, f"{folder}_voice_es.zip")
            
            print(f"  Descargando audio ES ({narrator})...", end=" ", flush=True)
            if download_file(voice_url, vzip):
                os.makedirs(voice_dir, exist_ok=True)
                # Intentar descomprimir con contraseña
                result = subprocess.run(["unzip", "-P", ZIP_PASSWORD, "-o", vzip, "-d", voice_dir],
                                       capture_output=True)
                if result.returncode != 0:
                    # Probar sin contraseña (algunos pueden no estar encriptados)
                    subprocess.run(["unzip", "-o", vzip, "-d", voice_dir], capture_output=True)
                os.remove(vzip)
                print("✓")
            else:
                print("✗")
    
    print(f"\n\n=== DESCARGA COMPLETA ===")
    print(f"Libros descargados en: {OUTPUT_DIR}")
    print(f"Total: {len(all_books)} libros")

if __name__ == "__main__":
    main()
