interface NetworkInformation {
  type: string;
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  addEventListener?: (event: 'change', callback: () => void) => void;
  removeEventListener?: (event: 'change', callback: () => void) => void;
}

interface Navigator {
  connection?: NetworkInformation;
}
