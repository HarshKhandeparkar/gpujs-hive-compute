export default function offsetKernel(kernelFunc: Function | string, outputDimensions: number): any {
  const kernelFuncStrArr = kernelFunc.toString().split('\n'); // Array of each line in the string format of a kernel function
  kernelFuncStrArr.splice(
    1, // The second line or 1st index
    0, // Insert an element instead of deleting
    `this.thread.x = this.thread.x + this.constants.hive_offset_x`,
    outputDimensions > 1 ? `this.thread.y = this.thread.y + this.constants.hive_offset_y` : ``,
    outputDimensions > 2 ? `this.thread.z = this.thread.z + this.constants.hive_offset_z` : ``
  )

  return kernelFuncStrArr.join('\n') // back to string
    .replace(/this\.output\.x/g, 'this.constants.hive_output_x') // Individual kernel output != overall hive output
    .replace(/this\.output\.y/g, 'this.constants.hive_output_y')
    .replace(/this\.output\.z/g, 'this.constants.hive_output_z')
}