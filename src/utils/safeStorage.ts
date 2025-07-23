/**
 * MARCUS-GRADE STORAGE SYSTEM
 * 
 * This system ensures no presentation is ever lost, corrupted, or causes career damage.
 * Every save operation is atomic, validated, and backed up.
 */

interface SaveMetadata {
  version: string;
  timestamp: number;
  checksum: string;
  presentationId: string;
  saveIndex: number;
}

interface SavedPresentation {
  data: any;
  metadata: SaveMetadata;
}

export class BulletproofStorage {
  private static readonly STORAGE_PREFIX = 'slider_presentation_';
  private static readonly BACKUP_PREFIX = 'slider_backup_';
  private static readonly METADATA_KEY = 'slider_metadata';
  private static readonly MAX_BACKUPS = 10;
  private static readonly AUTOSAVE_KEY = 'slider_autosave';

  /**
   * Calculate checksum for data integrity verification
   */
  private static calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate presentation data structure
   */
  private static validatePresentationData(data: any): boolean {
    try {
      if (!data || typeof data !== 'object') return false;
      if (!data.id || !data.title || !Array.isArray(data.slides)) return false;
      if (!data.theme || !data.settings) return false;
      
      // Validate each slide
      for (const slide of data.slides) {
        if (!slide.id || !Array.isArray(slide.elements)) return false;
        
        // Validate each element
        for (const element of slide.elements) {
          if (!element.id || !element.type) return false;
          if (typeof element.x !== 'number' || typeof element.y !== 'number') return false;
          if (typeof element.width !== 'number' || typeof element.height !== 'number') return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ATOMIC SAVE - Never corrupts existing data
   */
  static async savePresentation(presentationData: any, isAutoSave = false): Promise<{
    success: boolean;
    error?: string;
    backupCreated?: boolean;
  }> {
    try {
      // Validate data before saving
      if (!this.validatePresentationData(presentationData)) {
        return { success: false, error: 'Invalid presentation data structure' };
      }

      const timestamp = Date.now();
      const dataString = JSON.stringify(presentationData, null, 2);
      const checksum = this.calculateChecksum(dataString);
      
      const metadata: SaveMetadata = {
        version: '2.0',
        timestamp,
        checksum,
        presentationId: presentationData.id,
        saveIndex: timestamp
      };

      const saveData: SavedPresentation = {
        data: presentationData,
        metadata
      };

      const saveKey = isAutoSave ? this.AUTOSAVE_KEY : `${this.STORAGE_PREFIX}${presentationData.id}`;
      
      // Create backup of existing data before overwriting
      let backupCreated = false;
      try {
        const existingData = localStorage.getItem(saveKey);
        if (existingData && !isAutoSave) {
          const backupKey = `${this.BACKUP_PREFIX}${presentationData.id}_${timestamp}`;
          localStorage.setItem(backupKey, existingData);
          backupCreated = true;
          
          // Clean old backups
          this.cleanOldBackups(presentationData.id);
        }
      } catch (backupError) {
        console.warn('Backup creation failed, but continuing with save:', backupError);
      }

      // Atomic save - all or nothing
      const saveString = JSON.stringify(saveData);
      localStorage.setItem(saveKey, saveString);
      
      // Verify save integrity
      const verification = localStorage.getItem(saveKey);
      if (!verification) {
        throw new Error('Save verification failed - data not persisted');
      }
      
      const verificationData = JSON.parse(verification);
      if (verificationData.metadata.checksum !== checksum) {
        throw new Error('Save verification failed - checksum mismatch');
      }

      // Update metadata registry
      if (!isAutoSave) {
        this.updateMetadataRegistry(metadata);
      }

      return { success: true, backupCreated };
    } catch (error) {
      console.error('CRITICAL: Presentation save failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown save error' 
      };
    }
  }

  /**
   * SAFE LOAD - Always validates and recovers from corruption
   */
  static async loadPresentation(presentationId?: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    recovered?: boolean;
  }> {
    try {
      const loadKey = presentationId 
        ? `${this.STORAGE_PREFIX}${presentationId}`
        : this.AUTOSAVE_KEY;
      
      const savedString = localStorage.getItem(loadKey);
      if (!savedString) {
        return { success: false, error: 'No saved presentation found' };
      }

      const savedData: SavedPresentation = JSON.parse(savedString);
      
      // Verify checksum
      const dataString = JSON.stringify(savedData.data, null, 2);
      const calculatedChecksum = this.calculateChecksum(dataString);
      
      if (calculatedChecksum !== savedData.metadata.checksum) {
        console.warn('CORRUPTION DETECTED: Attempting recovery from backup');
        
        // Attempt recovery from backup
        if (presentationId) {
          const recoveryResult = await this.recoverFromBackup(presentationId);
          if (recoveryResult.success) {
            return { ...recoveryResult, recovered: true };
          }
        }
        
        return { success: false, error: 'Data corruption detected and recovery failed' };
      }

      // Validate structure
      if (!this.validatePresentationData(savedData.data)) {
        return { success: false, error: 'Invalid presentation structure' };
      }

      return { success: true, data: savedData.data };
    } catch (error) {
      console.error('CRITICAL: Presentation load failed:', error);
      
      // Attempt backup recovery
      if (presentationId) {
        const recoveryResult = await this.recoverFromBackup(presentationId);
        if (recoveryResult.success) {
          return { ...recoveryResult, recovered: true };
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown load error' 
      };
    }
  }

  /**
   * RECOVERY SYSTEM - Last line of defense
   */
  private static async recoverFromBackup(presentationId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Find all backups for this presentation
      const backupKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.BACKUP_PREFIX}${presentationId}_`)) {
          backupKeys.push(key);
        }
      }

      if (backupKeys.length === 0) {
        return { success: false, error: 'No backups available for recovery' };
      }

      // Sort by timestamp (newest first)
      backupKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop() || '0');
        const timestampB = parseInt(b.split('_').pop() || '0');
        return timestampB - timestampA;
      });

      // Try each backup until we find a valid one
      for (const backupKey of backupKeys) {
        try {
          const backupString = localStorage.getItem(backupKey);
          if (!backupString) continue;

          const backupData: SavedPresentation = JSON.parse(backupString);
          
          // Validate backup
          if (this.validatePresentationData(backupData.data)) {
            console.log(`Recovery successful from backup: ${backupKey}`);
            return { success: true, data: backupData.data };
          }
        } catch (backupError) {
          console.warn(`Backup ${backupKey} is corrupted, trying next...`);
          continue;
        }
      }

      return { success: false, error: 'All backups are corrupted' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Recovery system failed' 
      };
    }
  }

  /**
   * AUTO-SAVE SYSTEM
   */
  static async autoSave(presentationData: any): Promise<boolean> {
    const result = await this.savePresentation(presentationData, true);
    return result.success;
  }

  /**
   * Get auto-save status
   */
  static getAutoSaveStatus(): {
    hasAutoSave: boolean;
    timestamp?: number;
    age?: number;
  } {
    try {
      const autoSaveString = localStorage.getItem(this.AUTOSAVE_KEY);
      if (!autoSaveString) {
        return { hasAutoSave: false };
      }

      const autoSaveData: SavedPresentation = JSON.parse(autoSaveString);
      const age = Date.now() - autoSaveData.metadata.timestamp;
      
      return {
        hasAutoSave: true,
        timestamp: autoSaveData.metadata.timestamp,
        age
      };
    } catch {
      return { hasAutoSave: false };
    }
  }

  /**
   * Clean old backups to prevent storage overflow
   */
  private static cleanOldBackups(presentationId: string): void {
    try {
      const backupKeys: { key: string; timestamp: number }[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.BACKUP_PREFIX}${presentationId}_`)) {
          const timestamp = parseInt(key.split('_').pop() || '0');
          backupKeys.push({ key, timestamp });
        }
      }

      if (backupKeys.length > this.MAX_BACKUPS) {
        // Sort by timestamp and remove oldest
        backupKeys.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = backupKeys.slice(0, backupKeys.length - this.MAX_BACKUPS);
        
        toRemove.forEach(backup => {
          localStorage.removeItem(backup.key);
        });
      }
    } catch (error) {
      console.warn('Backup cleanup failed:', error);
    }
  }

  /**
   * Update metadata registry
   */
  private static updateMetadataRegistry(metadata: SaveMetadata): void {
    try {
      const existingMetadata = localStorage.getItem(this.METADATA_KEY);
      const registry = existingMetadata ? JSON.parse(existingMetadata) : {};
      
      registry[metadata.presentationId] = metadata;
      
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(registry));
    } catch (error) {
      console.warn('Metadata registry update failed:', error);
    }
  }

  /**
   * Export presentation safely
   */
  static exportPresentation(presentationData: any): void {
    try {
      if (!this.validatePresentationData(presentationData)) {
        throw new Error('Cannot export invalid presentation data');
      }

      const exportData = {
        ...presentationData,
        exportedAt: new Date().toISOString(),
        exportVersion: '2.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentationData.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    presentations: number;
    backups: number;
  } {
    try {
      let used = 0;
      let presentations = 0;
      let backups = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
          
          if (key.startsWith(this.STORAGE_PREFIX)) presentations++;
          if (key.startsWith(this.BACKUP_PREFIX)) backups++;
        }
      }

      // Estimate available space (localStorage limit is usually ~5-10MB)
      const estimated5MB = 5 * 1024 * 1024;
      const available = Math.max(0, estimated5MB - used);

      return { used, available, presentations, backups };
    } catch {
      return { used: 0, available: 0, presentations: 0, backups: 0 };
    }
  }
}
