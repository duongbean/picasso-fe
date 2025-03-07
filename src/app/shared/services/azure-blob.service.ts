import { Injectable } from '@angular/core';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root',
})
export class AzureBlobService {
  private STORAGE_ACCOUNT_NAME = 'yenstorage1';
  private CONTAINER_NAME = 'avatar';
  private SAS_TOKEN =
    'sp=r&st=2025-02-05T03:10:26Z&se=2025-02-05T11:10:26Z&spr=https&sv=2022-11-02&sr=c&sig=x6xmUn4gec%2BkK%2FDhgDxhM3YaJ2ViQz7XYgXsQ%2BOugAA%3D';

  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    // Initialize Blob Service Client with SAS Token
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.STORAGE_ACCOUNT_NAME}.blob.core.windows.net?${this.SAS_TOKEN}`
    );
    this.containerClient = this.blobServiceClient.getContainerClient(
      this.CONTAINER_NAME
    );
  }

  /**
   * Get Secure Blob URL with SAS Token
   * @param fileName - The file name stored in Azure Blob Storage
   * @returns - A secure URL to access the file
   */
  async getBlobUrl(fileName: string): Promise<string> {
    const blobClient = this.containerClient.getBlobClient(fileName);
    return blobClient.url; // URL will contain the SAS token
  }
}
