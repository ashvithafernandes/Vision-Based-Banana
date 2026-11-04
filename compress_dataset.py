import os
import sys
import time
import glob
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from tqdm import tqdm

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

TARGET_SIZE = (512, 512)
JPEG_QUALITY = 90
MAX_WORKERS = min(8, os.cpu_count() or 4)

def process_single_image(args):
    src_path, dst_path = args
    try:
        # Check if already processed and valid
        if os.path.exists(dst_path) and os.path.getsize(dst_path) > 1024:
            return os.path.getsize(dst_path), True, None
        
        # Check file size (skip corrupt tiny files like scripts disguised as jpg)
        if os.path.getsize(src_path) < 1024:
            return 0, False, "File too small (<1KB)"

        with Image.open(src_path) as img:
            img = img.convert("RGB")
            # High-quality bilinear resize (crisp and fast)
            resized_img = img.resize(TARGET_SIZE, Image.Resampling.BILINEAR)
            resized_img.save(dst_path, format="JPEG", quality=JPEG_QUALITY, optimize=True)

        return os.path.getsize(dst_path), True, None
    except Exception as e:
        return 0, False, str(e)

def compress_class(class_name, src_dir, dst_dir):
    src_folder = os.path.join(src_dir, class_name)
    dst_folder = os.path.join(dst_dir, class_name)
    os.makedirs(dst_folder, exist_ok=True)

    files = sorted(glob.glob(os.path.join(src_folder, "*")))
    task_args = []
    for f in files:
        fname = os.path.basename(f)
        dst_path = os.path.join(dst_folder, fname)
        task_args.append((f, dst_path))

    print(f"\nProcessing class '{class_name}' ({len(task_args)} images)...")
    total_bytes = 0
    successful = 0
    skipped_or_corrupt = 0

    with tqdm(
        total=len(task_args),
        desc=f"Compressing {class_name}",
        unit="img",
        ncols=95,
        ascii=True,
    ) as pbar:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = [executor.submit(process_single_image, arg) for arg in task_args]
            for fut in as_completed(futures):
                size, success, err = fut.result()
                if success:
                    successful += 1
                    total_bytes += size
                else:
                    skipped_or_corrupt += 1
                pbar.update(1)

    print(f"[DONE] {class_name}: {successful} images compressed ({total_bytes / (1024*1024):.2f} MB), {skipped_or_corrupt} skipped.")
    return successful, total_bytes

def create_zip_archive(src_dir, output_zip):
    print(f"\nPackaging compressed dataset into zip: {output_zip}...")
    start_t = time.perf_counter()
    
    file_list = []
    for root, _, files in os.walk(src_dir):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, src_dir)
            file_list.append((full_path, rel_path))

    # Using ZIP_DEFLATED (or STORED) since JPEGs are already compressed
    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=1) as zf:
        with tqdm(total=len(file_list), desc="Zipping", unit="files", ncols=95, ascii=True) as pbar:
            for full_p, rel_p in file_list:
                zf.write(full_p, rel_p)
                pbar.update(1)

    elapsed = time.perf_counter() - start_t
    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"[DONE] Created '{os.path.basename(output_zip)}' ({zip_size_mb:.2f} MB) in {elapsed:.2f}s!")

def main():
    base_dir = r"d:\Datasets"
    compressed_dir = os.path.join(base_dir, "Datasets_Compressed_512")
    output_zip = os.path.join(base_dir, "Carbide_Dataset_512.zip")

    start_all = time.perf_counter()
    print("=" * 70)
    print("STARTING DATASET COMPRESSION (Option 1: 512x512, High Quality Q=90)")
    print(f"Destination Folder: {compressed_dir}")
    print(f"Final Zip Target:   {output_zip}")
    print(f"Worker Threads:     {MAX_WORKERS}")
    print("=" * 70)

    total_images = 0
    total_size = 0
    for cls in ["With Carbide", "Without Carbide"]:
        count, sz = compress_class(cls, base_dir, compressed_dir)
        total_images += count
        total_size += sz

    create_zip_archive(compressed_dir, output_zip)

    total_elapsed = time.perf_counter() - start_all
    print("\n" + "=" * 70)
    print(f"[ALL COMPLETE] Processed {total_images:,} images in {total_elapsed:.2f} seconds!")
    print(f"Folder size: {total_size / (1024*1024):.2f} MB")
    print(f"Zip file:    {os.path.getsize(output_zip) / (1024*1024):.2f} MB (at {output_zip})")
    print("=" * 70)

if __name__ == "__main__":
    main()
