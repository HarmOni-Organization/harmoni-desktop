/* eslint-disable no-await-in-loop */
import { uiStore } from '@core/stores/UIStore';

export class UICommandUtils {
  /**
   * Delays execution to simulate human behavior.
   * @param baseMilliseconds - Base delay time in milliseconds.
   */
  private static async simulateHumanDelay(baseMilliseconds: number) {
    const randomExtraDelay = Math.random() * 200; // Adds random delay up to 200ms
    const totalDelay = baseMilliseconds + randomExtraDelay;
    return new Promise((resolve) => {
      setTimeout(resolve, totalDelay);
    });
  }

  /**
   * Delays execution by a specified time.
   * @param milliseconds - Delay time in milliseconds.
   */
  private static async delay(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  /**
   * Temporarily highlights a DOM element to simulate focus or hover effects.
   * @param element - The target DOM element.
   * @param effect - Effect type: "focus" or "hover".
   */
  private static applyTemporaryHighlight(
    element: HTMLElement,
    effect: 'focus' | 'hover',
  ): void {
    const highlightClass =
      effect === 'focus' ? 'highlight-focus' : 'highlight-hover';
    element.classList.add(highlightClass);
    setTimeout(() => element.classList.remove(highlightClass), 300); // Remove highlight after 300ms
  }

  /**
   * Simulates typing text into an input field.
   * @param inputId - The ID of the input element.
   * @param text - The text to type.
   * @param options - Additional options like state synchronization or custom delays.
   */
  public static async typeIntoInput(
    inputId: string,
    text: string,
    options?: {
      syncState?: React.Dispatch<React.SetStateAction<string>>;
      typingDelay?: number;
      bypassExistenceCheck?: boolean;
      elementType?: string;
      skipFocusAction?: boolean;
      customErrorMessage?: string;
    },
  ): Promise<void> {
    try {
      const inputElement = this.getElementById<HTMLInputElement>(
        inputId,
        options?.elementType || 'input',
        { skipExistenceCheck: options?.bypassExistenceCheck },
      );

      if (!options?.skipFocusAction) {
        inputElement.focus();
        this.applyTemporaryHighlight(inputElement, 'focus');
      }

      let currentValue = '';
      await Promise.all(
        text.split('').map(async (char, index) => {
          await this.delay((options?.typingDelay || 100) * (index + 1));

          currentValue += char;
          inputElement.value = currentValue;
          if (options?.syncState) options?.syncState(currentValue);
          uiStore.setInputValue(inputId, inputElement.value);
        }),
      );

      inputElement.blur();
      console.log(`Input with ID "${inputId}" received text: "${text}".`);
    } catch (error) {
      // console.error(`typeIntoInput Error: ${(error as Error).message}`);
      throw new Error(
        options?.customErrorMessage ||
          `typeIntoInput Error: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Simulates hovering and clicking on a button.
   * @param buttonId - The ID of the button element.
   * @param onClickCallback - Optional callback triggered after the click.
   */
  public static async hoverAndClick(
    elementId: string,
    options?: {
      onClickCallback?: () => void;
      customErrorMessage?: string;
      elementType?: 'button' | 'div';
    },
  ): Promise<void> {
    try {
      const elementToClick = this.getElementById<HTMLElement>(
        elementId,
        options?.elementType || 'button',
      );
      this.applyTemporaryHighlight(elementToClick, 'hover');
      await this.delay(500); // Hover duration

      elementToClick.click();
      if (options?.onClickCallback) options?.onClickCallback();
      console.log(`Button with ID "${elementId}" was clicked.`);
    } catch (error) {
      // console.error(`hoverAndClick Error: ${(error as Error).message}`);
      throw new Error(
        options?.customErrorMessage ||
          `hoverAndClick Error: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Scrolls smoothly to a section and applies hover effect.
   * @param sectionId - The ID of the section element.
   * @param onComplete - Optional callback after scrolling.
   */
  public static async scrollTo(
    sectionId: string,
    onComplete?: () => void,
  ): Promise<void> {
    try {
      const sectionElement = this.getElementById<HTMLElement>(sectionId, 'div');
      this.applyTemporaryHighlight(sectionElement, 'hover');
      await this.delay(500); // Hover simulation
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      console.log(`Scrolled to section with ID "${sectionId}".`);
      if (onComplete) onComplete();
    } catch (error) {
      console.error(`scrollTo Error: ${(error as Error).message}`);
    }
  }

  /**
   * Updates a value in the UI store.
   * @param inputId - The input field ID.
   * @param value - The value to update.
   */
  public static updateStoreValue(inputId: string, value: unknown): void {
    try {
      uiStore.setInputValue(inputId, value);
      console.log(`UIStore updated: { ${inputId}: ${value} }`);
    } catch (error) {
      console.error(`updateStoreValue Error: ${(error as Error).message}`);
    }
  }

  /**
   * Validates the presence and type of a DOM element.
   * @param elementId - The ID of the element.
   * @param expectedTag - Expected HTML tag name.
   * @param options - Options to bypass existence checks.
   * @returns The validated element.
   * @throws Error if validation fails.
   */
  public static getElementById<T extends HTMLElement>(
    elementId: string,
    expectedTag: string,
    options?: { skipExistenceCheck?: boolean; customErrorMessage?: string },
  ): T {
    const element = document.getElementById(elementId) as T;
    if (!element) {
      throw new Error(
        options?.customErrorMessage ||
          `Element with ID "${elementId}" not found.`,
      );
    }
    if (
      !options?.skipExistenceCheck &&
      element.tagName.toLowerCase() !== expectedTag.toLowerCase()
    ) {
      throw new Error(
        options?.customErrorMessage ||
          `Element with ID "${elementId}" is not a valid ${expectedTag} element.`,
      );
    }
    return element;
  }

  /**
   * Executes multiple asynchronous commands in sequence.
   * Provides enhanced error handling and configurable stopping behavior.
   * @param commands - Array of async command functions.
   * @param options - Optional settings like delay and error handling.
   * @returns Result of each command or stops on error based on options.
   */
  public static async executeSequentially(
    commands: (() => Promise<void> | unknown)[],
    options?: {
      delayBetweenCommands?: number;
      stopOnError?: boolean;
      onError?: (error: Error, index: number) => void;
      onAllSuccess?: () => void;
      blockUI?: boolean;
    },
  ): Promise<void> {
    if (options?.blockUI) this.blockUI();
    for (let index = 0; index < commands.length; index += 1) {
      const command = commands[index];
      try {
        await command();
        if (options?.delayBetweenCommands) {
          await this.delay(options.delayBetweenCommands);
        }
        if (commands.length - 1 === index && options?.onAllSuccess) {
          console.log('All commands executed successfully.');

          options?.onAllSuccess();
        }
      } catch (error) {
        console.error(
          `Command ${index + 1} failed: ${(error as Error).message}`,
        );
        if (options?.onError) {
          options.onError(error as Error, index);
        }
        if (options?.stopOnError) {
          console.error(
            `Execution stopped at command ${index + 1}: ${(error as Error).message}`,
          );
          break;
        }
      }
    }
    if (options?.blockUI) this.unblockUI();
  }

  /**
   * Block the UI to prevent user interactions.
   */
  static blockUI() {
    const blocker = document.createElement('div');
    blocker.id = 'ui-blocker';
    blocker.style.position = 'fixed';
    blocker.style.top = '0';
    blocker.style.left = '0';
    blocker.style.width = '100%';
    blocker.style.height = '100%';
    blocker.style.backgroundColor = 'transparent';
    blocker.style.zIndex = '1000';
    blocker.style.cursor = 'not-allowed';
    document.body.appendChild(blocker);
  }

  /**
   * Unblock the UI to allow user interactions.
   */
  static unblockUI() {
    const blocker = document.getElementById('ui-blocker');
    if (blocker) {
      blocker.remove();
    }
  }
}
