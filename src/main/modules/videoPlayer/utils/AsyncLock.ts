class AsyncLock {
  private lock: Promise<void> = Promise.resolve();

  private queueLength = 0;

  async acquire(timeout?: number): Promise<void> {
    let release: () => void;
    const newLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentLock = this.lock;

    this.lock = newLock;
    this.queueLength += 1;

    // Timeout logic (optional)
    if (timeout) {
      const timeoutPromise = new Promise<void>((_resolve, reject) => {
        setTimeout(
          () => reject(new Error('Mutex acquisition timed out')),
          timeout,
        );
      });

      try {
        await Promise.race([currentLock, timeoutPromise]);
      } catch (error) {
        this.queueLength -= 1; // Ensure queue length is updated on timeout
        release!(); // Release the lock to prevent deadlocks
        throw error; // Rethrow the timeout error
      }
    } else {
      await currentLock;
    }

    this.queueLength -= 1;
    release!(); // Release the lock after acquiring
  }

  getQueueLength(): number {
    return this.queueLength;
  }

  async executeInQueue(
    task: () => Promise<void>,
    timeout?: number,
  ): Promise<void> {
    await this.acquire(timeout);
    await task();
  }
}

export default AsyncLock;
