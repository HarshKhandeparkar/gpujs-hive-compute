import { GPU, IKernelRunShortcut, KernelOutput } from 'gpu.js';

import { COMM_TYPE, ASK_ACTIONS, TELL_ACTIONS } from './constants';
import { ASK_DATA } from './types';
import { onAsk, tell, onTell } from './comm';

/**
 * 
 * @param gpu Instance of GPU.js `GPU` class
 * @param url WebSocket URL e.g: ws://localhost:4532
 * @param logFunction A custom log function
 */
export function runHelper(WS, gpu: GPU, url: string, logFunction: Function = console.log) {
  const ws = new WS(url);
  let k: IKernelRunShortcut; // build kernel will be stored here
  
  ws.on('open', () => {
    logFunction('Connecting as helper.');
    ws.send(JSON.stringify({type: COMM_TYPE.REQUEST_CONN, data: {}}));
  
    onTell(ws, TELL_ACTIONS.CONN_ACCEPTED, () => logFunction('Connection Accepted.'));
  })
  
  ws.on('close', () => logFunction(`Connection refused or closed unexpectedly.`))
  
  onAsk(ws, ASK_ACTIONS.BUILD_KERNEL, (data: ASK_DATA) => { // Build the kernel
    logFunction('building');
    k = gpu.createKernel(data.extras.kernelFunc, data.extras.kernelOptions); //  Build the kernel
    logFunction('built');
  
    tell(ws, {
      action: TELL_ACTIONS.KERNEL_BUILT
    })
  })
  
  onAsk(ws, ASK_ACTIONS.RUN_KERNEL, (data: ASK_DATA) => { // Run the kernel
    logFunction('running');
    let output: KernelOutput;
    if (data.extras.inputsLength > 0) output = k(...data.extras.inputs); //  Run the kernel
    else output = k();
    logFunction('done');
  
    tell(ws, {
      action: TELL_ACTIONS.KERNEL_RUN_DONE,
      extras: {
        output: output
      }
    })
  })
}