import { makeAutoObservable } from 'mobx';

class TimerStore {
  private timers: Record<string, number> = {}; // Stores start times

  private logs: { task: string; duration: number }[] = []; // Stores log data

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Start a timer for a given task.
   * @param taskName - Unique name for the timer.
   */
  startTimer(taskName: string) {
    if (this.timers[taskName]) {
      console.warn(`Timer for '${taskName}' is already running.`);
      return;
    }
    this.timers[taskName] = Date.now();
    console.log(`[Timer] Started: ${taskName}`);
  }

  /**
   * Stop a timer and log the elapsed time.
   * @param taskName - Unique name for the timer.
   */
  stopTimer(taskName: string) {
    const startTime = this.timers[taskName];
    if (!startTime) {
      console.warn(`[Timer] No active timer found for '${taskName}'.`);
      return;
    }

    const duration = Date.now() - startTime;
    delete this.timers[taskName];

    // Store the log
    this.logs.push({ task: taskName, duration });

    console.log(`[Timer] Finished: ${taskName} | Duration: ${duration}ms`);
  }

  /**
   * Get all logged times for analysis.
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Reset all timers and logs.
   */
  resetAll() {
    this.timers = {};
    this.logs = [];
    console.log(`[Timer] All timers and logs have been reset.`);
  }
}

// Create a global instance of the timer store
const timerStore = new TimerStore();
export default timerStore;
