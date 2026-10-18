import sys

import onnx
from onnxruntime.quantization.matmul_nbits_quantizer import MatMulNBitsQuantizer

source, target = sys.argv[1], sys.argv[2]
quantizer = MatMulNBitsQuantizer(onnx.load(source), bits=4, block_size=32, is_symmetric=True, accuracy_level=4)
quantizer.process()
onnx.save_model(quantizer.model.model, target)
