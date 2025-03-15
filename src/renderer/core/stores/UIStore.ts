/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable } from 'mobx';

class UIStore {
  inputs: Record<string, unknown> = {}; // Store string, number, or null values

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Set a value for a specific container.
   * If the container does not exist, initialize it.
   * @param containerId - Unique identifier for the container.
   * @param value - The value to set.
   */
  setInputValue(containerId: string, value: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting input value:', { containerId, value });
    }
    this.inputs[containerId] = value;
  }

  /**
   * Get the value of a specific container.
   * @param containerId - Unique identifier for the container.
   * @returns - The value of the container, or `undefined` if it doesn't exist.
   */
  getInputValue<T = unknown>(containerId: string): T | undefined {
    return this.inputs[containerId] as T | undefined;
  }

  /**
   * Clear a specific container value.
   * @param containerId - Unique identifier for the container.
   */
  clearInput(containerId: string) {
    if (containerId in this.inputs) {
      delete this.inputs[containerId];
    }
  }

  /**
   * Clear all stored input values.
   */
  clearAllInputs() {
    this.inputs = {};
  }

  /**
   * Check if a container exists.
   * @param containerId - Unique identifier for the container.
   * @returns - `true` if the container exists, otherwise `false`.
   */
  hasInput(containerId: string): boolean {
    return containerId in this.inputs;
  }

  /**
   * Initialize default values for inputs.
   * @param defaults - An object with default values to initialize.
   */
  initializeInputs(defaults: Record<string, unknown>) {
    this.inputs = { ...this.inputs, ...defaults };
  }
}

export const uiStore = new UIStore();
