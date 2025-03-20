import argparse
import os
import io
import zipfile
import grequests

UPLOAD_URL = "http://host.docker.internal:3000/ecr-viewer/api/process-zip"
BASEDIR = os.path.dirname(os.path.abspath(__file__))


def _get_args():
    parser = argparse.ArgumentParser(
        description="Zip subfolders and upload them to the ECR Viewer API.",
    )
    return parser.parse_args()


def zip_folder(folder_path):
    """Zips the given folder into an in-memory ZIP file."""
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, _, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                zip_file.write(file_path, arcname=arcname)
    zip_buffer.seek(0)  # Move to the beginning of the buffer
    return zip_buffer


def _process_files():
    """Zips subfolders and sends them to the API."""
    print("Processing subfolders...")

    subfolders_raw = os.getenv("SEED_DATA_DIRECTORIES")
    if not subfolders_raw:
        print("No subfolders found in SEED_DATA_DIRECTORIES.")
        return

    subfolders = subfolders_raw.split(",")

    requests = []
    folder_paths = []

    for subfolder in subfolders:
        subfolder_path = os.path.join(BASEDIR, "baseECR", subfolder)

        if not os.path.isdir(subfolder_path):
            print(f"Skipping: {subfolder_path} is not a valid directory.")
            continue

        for folder in os.listdir(subfolder_path):
            folder_path = os.path.join(subfolder_path, folder)
            if not os.path.isdir(folder_path):
                continue

            print(f"Zipping and uploading: {folder_path}")

            zip_buffer = zip_folder(folder_path)

            files = [('upload_file', (f"{folder}.zip", zip_buffer, "application/zip"))]
            print(files)
            request = grequests.post(UPLOAD_URL, files=files)

            requests.append(request)
            folder_paths.append(folder_path)

    print(f"Sending {len(requests)} ZIP files...")

    # Send requests asynchronously
    failed = []
    for index, response in enumerate(grequests.imap(requests, size=8)):
        folder_path = folder_paths[index]

        if response is None:
            failed.append(folder_path)
            print(f"❌ Failed to upload {folder_path}: No response received")
            continue
        if response.status_code != 200:
            failed.append(folder_path)
            print(f"❌ Failed to upload {folder_path}. Status: {response.status_code}")
        else:
            print(f"✅ Successfully uploaded {folder_path}")

    print(f"Processing complete. {len(failed)} failures: {failed}")
    if failed:
        exit(1)


if __name__ == "__main__":
    args = _get_args()
    _process_files()
