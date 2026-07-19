export class Recovery {
  constructor() {
    this.recoveryQueue = new Map();
  }

  queueRecovery(guildId, backupData) {
    const recoveryId = `${guildId}-${Date.now()}`;
    const recovery = {
      id: recoveryId,
      guildId,
      backupData,
      status: 'pending',
      timestamp: Date.now(),
      progress: 0,
    };

    this.recoveryQueue.set(recoveryId, recovery);
    return recovery;
  }

  getRecovery(recoveryId) {
    return this.recoveryQueue.get(recoveryId);
  }

  updateStatus(recoveryId, status) {
    const recovery = this.recoveryQueue.get(recoveryId);
    if (recovery) {
      recovery.status = status;
    }
    return recovery;
  }

  updateProgress(recoveryId, progress) {
    const recovery = this.recoveryQueue.get(recoveryId);
    if (recovery) {
      recovery.progress = progress;
    }
    return recovery;
  }

  completeRecovery(recoveryId) {
    const recovery = this.recoveryQueue.get(recoveryId);
    if (recovery) {
      recovery.status = 'completed';
      recovery.completedAt = Date.now();
    }
    return recovery;
  }

  removeRecovery(recoveryId) {
    return this.recoveryQueue.delete(recoveryId);
  }
}

export const recovery = new Recovery();
