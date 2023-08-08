import { expose } from 'comlink'

import { generate } from '../utils/generator'

const worker = {
  generate,
}

export type GeneratorWorkerType = typeof worker

expose(worker)
