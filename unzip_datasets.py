import os
import sys
import time
import zipfile
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

tls = threading.local()

def get_zip_handle(zip_path: str) -> zipfile.ZipFile:
    if not hasattr(tls, "zips"):
        tls.zips = {}
    if zip_path not in tls.zips:
        tls.zips[zip_path] = zipfile.ZipFile(zip_path, "r")
    return tls.zips[zip_path]

def extract_single_member(zip_path: str, member: zipfile.ZipInfo, output_dir: str):
    target_path = os.path.join(output_dir, member.filename)
    # If already extracted and file size matches, skip redundant work
    if os.path.isfile(target_path) and os.path.getsize(target_path) == member.file_size:
        return member.file_size, True
    
    z = get_zip_handle(zip_path)
    z.extract(member, output_dir)
    return member.file_size, False

def unzip_archive(zip_path: str, output_dir: str, max_workers: int = 8):
    if not os.path.exists(zip_path):
        print(f"Error: Archive not found: {zip_path}", file=sys.stderr)
        return

    print(f"\n{'='*70}")
    print(f"Archive: {os.path.basename(zip_path)}")
    print(f"Destination: {output_dir}")
    print(f"Workers: {max_workers} threads")

    with zipfile.ZipFile(zip_path, "r") as z:
        all_members = z.infolist()

    # Pre-create all required directory structures
    file_members = []
    total_bytes = 0

    for m in all_members:
        target_path = os.path.join(output_dir, m.filename)
        if m.is_dir():
            os.makedirs(target_path, exist_ok=True)
        else:
            parent_dir = os.path.dirname(target_path)
            if parent_dir:
                os.makedirs(parent_dir, exist_ok=True)
            file_members.append(m)
            total_bytes += m.file_size

    total_files = len(file_members)
    total_mb = total_bytes / (1024 * 1024)
    print(f"Files to process: {total_files:,} ({total_mb:.2f} MB uncompressed)")
    print(f"{'='*70}")

    start_time = time.perf_counter()

    with tqdm(
        total=total_bytes,
        unit="B",
        unit_scale=True,
        unit_divisor=1024,
        desc=f"Extracting {os.path.basename(zip_path)}",
        ncols=100,
        ascii=True,
    ) as pbar:
        completed_files = 0
        skipped_count = 0
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [
                executor.submit(extract_single_member, zip_path, m, output_dir)
                for m in file_members
            ]
            for future in as_completed(futures):
                bytes_extracted, skipped = future.result()
                completed_files += 1
                if skipped:
                    skipped_count += 1
                pbar.update(bytes_extracted)
                if completed_files % 100 == 0 or completed_files == total_files:
                    pbar.set_postfix(files=f"{completed_files}/{total_files}")

    elapsed = time.perf_counter() - start_time
    avg_speed = (total_bytes / (1024 * 1024)) / elapsed if elapsed > 0 else 0
    if skipped_count == total_files:
        print(f"[VERIFIED] {os.path.basename(zip_path)}: All {total_files} files already extracted and valid.")
    else:
        print(f"[DONE] Finished {os.path.basename(zip_path)} in {elapsed:.2f}s (~{avg_speed:.2f} MB/s)")

def main():
    base_dir = r"d:\Datasets"
    archives = [
        os.path.join(base_dir, "With Carbide.zip"),
        os.path.join(base_dir, "Without Carbide.zip"),
    ]

    total_start = time.perf_counter()
    workers = min(8, os.cpu_count() or 4)

    for archive in archives:
        unzip_archive(archive, base_dir, max_workers=workers)

    total_elapsed = time.perf_counter() - total_start
    print(f"\n{'='*70}")
    print(f"[ALL COMPLETE] All extractions completed in {total_elapsed:.2f} seconds!")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()
