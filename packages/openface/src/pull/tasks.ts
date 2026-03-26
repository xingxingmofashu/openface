import {
  AudioClassificationPipeline,
  AutomaticSpeechRecognitionPipeline,
  AutoModel,
  AutoModelForAudioClassification,
  AutoModelForCausalLM,
  AutoModelForCTC,
  AutoModelForDepthEstimation,
  AutoModelForDocumentQuestionAnswering,
  AutoModelForImageClassification,
  AutoModelForImageFeatureExtraction,
  AutoModelForImageSegmentation,
  AutoModelForImageToImage,
  AutoModelForMaskedLM,
  AutoModelForObjectDetection,
  AutoModelForQuestionAnswering,
  AutoModelForSemanticSegmentation,
  AutoModelForSeq2SeqLM,
  AutoModelForSequenceClassification,
  AutoModelForSpeechSeq2Seq,
  AutoModelForTextToSpectrogram,
  AutoModelForTextToWaveform,
  AutoModelForTokenClassification,
  AutoModelForUniversalSegmentation,
  AutoModelForVision2Seq,
  AutoModelForZeroShotObjectDetection,
  AutoProcessor,
  AutoTokenizer,
  BackgroundRemovalPipeline,
  DepthEstimationPipeline,
  DocumentQuestionAnsweringPipeline,
  FeatureExtractionPipeline,
  FillMaskPipeline,
  ImageClassificationPipeline,
  ImageFeatureExtractionPipeline,
  ImageSegmentationPipeline,
  ImageToImagePipeline,
  ImageToTextPipeline,
  ObjectDetectionPipeline,
  QuestionAnsweringPipeline,
  SummarizationPipeline,
  Text2TextGenerationPipeline,
  TextClassificationPipeline,
  TextGenerationPipeline,
  TextToAudioPipeline,
  TokenClassificationPipeline,
  TranslationPipeline,
  ZeroShotAudioClassificationPipeline,
  ZeroShotClassificationPipeline,
  ZeroShotImageClassificationPipeline,
  ZeroShotObjectDetectionPipeline
} from "@huggingface/transformers";


// TODO: Add types for TASK_ALIASES
export const TASK_ALIASES = {
  "sentiment-analysis": "text-classification",
  "ner": "token-classification",
  // "vqa": "visual-question-answering", // TODO: Add
  "asr": "automatic-speech-recognition",
  "text-to-speech": "text-to-audio",

  // Add for backwards compatibility
  "embeddings": "feature-extraction",
} as const


export const SUPPORTED_TASKS = {
  "text-classification": {
    "tokenizer": AutoTokenizer,
    "pipeline": TextClassificationPipeline,
    "model": AutoModelForSequenceClassification,
    "default": {
      // TODO: replace with original
      // "model": "distilbert-base-uncased-finetuned-sst-2-english",
      "model": "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    },
    "type": "text",
  },
  "token-classification": {
    "tokenizer": AutoTokenizer,
    "pipeline": TokenClassificationPipeline,
    "model": AutoModelForTokenClassification,
    "default": {
      // TODO: replace with original
      // "model": "Davlan/bert-base-multilingual-cased-ner-hrl",
      "model": "Xenova/bert-base-multilingual-cased-ner-hrl",
    },
    "type": "text",
  },
  "question-answering": {
    "tokenizer": AutoTokenizer,
    "pipeline": QuestionAnsweringPipeline,
    "model": AutoModelForQuestionAnswering,
    "default": {
      // TODO: replace with original
      // "model": "distilbert-base-cased-distilled-squad",
      "model": "Xenova/distilbert-base-cased-distilled-squad",
    },
    "type": "text",
  },

  "fill-mask": {
    "tokenizer": AutoTokenizer,
    "pipeline": FillMaskPipeline,
    "model": AutoModelForMaskedLM,
    "default": {
      // TODO: replace with original
      // "model": "bert-base-uncased",
      "model": "Xenova/bert-base-uncased",
    },
    "type": "text",
  },
  "summarization": {
    "tokenizer": AutoTokenizer,
    "pipeline": SummarizationPipeline,
    "model": AutoModelForSeq2SeqLM,
    "default": {
      // TODO: replace with original
      // "model": "sshleifer/distilbart-cnn-6-6",
      "model": "Xenova/distilbart-cnn-6-6",
    },
    "type": "text",
  },
  "translation": {
    "tokenizer": AutoTokenizer,
    "pipeline": TranslationPipeline,
    "model": AutoModelForSeq2SeqLM,
    "default": {
      // TODO: replace with original
      // "model": "t5-small",
      "model": "Xenova/t5-small",
    },
    "type": "text",
  },
  "text2text-generation": {
    "tokenizer": AutoTokenizer,
    "pipeline": Text2TextGenerationPipeline,
    "model": AutoModelForSeq2SeqLM,
    "default": {
      // TODO: replace with original
      // "model": "google/flan-t5-small",
      "model": "Xenova/flan-t5-small",
    },
    "type": "text",
  },
  "text-generation": {
    "tokenizer": AutoTokenizer,
    "pipeline": TextGenerationPipeline,
    "model": AutoModelForCausalLM,
    "default": {
      // TODO: replace with original
      // "model": "gpt2",
      "model": "Xenova/gpt2",
    },
    "type": "text",
  },
  "zero-shot-classification": {
    "tokenizer": AutoTokenizer,
    "pipeline": ZeroShotClassificationPipeline,
    "model": AutoModelForSequenceClassification,
    "default": {
      // TODO: replace with original
      // "model": "typeform/distilbert-base-uncased-mnli",
      "model": "Xenova/distilbert-base-uncased-mnli",
    },
    "type": "text",
  },
  "audio-classification": {
    "pipeline": AudioClassificationPipeline,
    "model": AutoModelForAudioClassification,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "superb/wav2vec2-base-superb-ks",
      "model": "Xenova/wav2vec2-base-superb-ks",
    },
    "type": "audio",
  },
  "zero-shot-audio-classification": {
    "tokenizer": AutoTokenizer,
    "pipeline": ZeroShotAudioClassificationPipeline,
    "model": AutoModel,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "laion/clap-htsat-fused",
      "model": "Xenova/clap-htsat-unfused",
    },
    "type": "multimodal",
  },
  "automatic-speech-recognition": {
    "tokenizer": AutoTokenizer,
    "pipeline": AutomaticSpeechRecognitionPipeline,
    "model": [AutoModelForSpeechSeq2Seq, AutoModelForCTC],
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "openai/whisper-tiny.en",
      "model": "Xenova/whisper-tiny.en",
    },
    "type": "multimodal",
  },
  "text-to-audio": {
    "tokenizer": AutoTokenizer,
    "pipeline": TextToAudioPipeline,
    "model": [AutoModelForTextToWaveform, AutoModelForTextToSpectrogram],
    "processor": [AutoProcessor, /* Some don't use a processor */ null],
    "default": {
      // TODO: replace with original
      // "model": "microsoft/speecht5_tts",
      "model": "Xenova/speecht5_tts",
    },
    "type": "text",
  },
  "image-to-text": {
    "tokenizer": AutoTokenizer,
    "pipeline": ImageToTextPipeline,
    "model": AutoModelForVision2Seq,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "nlpconnect/vit-gpt2-image-captioning",
      "model": "Xenova/vit-gpt2-image-captioning",
    },
    "type": "multimodal",
  },

  "image-classification": {
    // no tokenizer
    "pipeline": ImageClassificationPipeline,
    "model": AutoModelForImageClassification,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "google/vit-base-patch16-224",
      "model": "Xenova/vit-base-patch16-224",
    },
    "type": "multimodal",
  },

  "image-segmentation": {
    // no tokenizer
    "pipeline": ImageSegmentationPipeline,
    "model": [AutoModelForImageSegmentation, AutoModelForSemanticSegmentation, AutoModelForUniversalSegmentation],
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "facebook/detr-resnet-50-panoptic",
      "model": "Xenova/detr-resnet-50-panoptic",
    },
    "type": "multimodal",
  },
  "background-removal": {
    // no tokenizer
    "pipeline": BackgroundRemovalPipeline,
    "model": [AutoModelForImageSegmentation, AutoModelForSemanticSegmentation, AutoModelForUniversalSegmentation],
    "processor": AutoProcessor,
    "default": {
      "model": "Xenova/modnet",
    },
    "type": "image",
  },

  "zero-shot-image-classification": {
    "tokenizer": AutoTokenizer,
    "pipeline": ZeroShotImageClassificationPipeline,
    "model": AutoModel,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "openai/clip-vit-base-patch32",
      "model": "Xenova/clip-vit-base-patch32",
    },
    "type": "multimodal",
  },

  "object-detection": {
    // no tokenizer
    "pipeline": ObjectDetectionPipeline,
    "model": AutoModelForObjectDetection,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "facebook/detr-resnet-50",
      "model": "Xenova/detr-resnet-50",
    },
    "type": "multimodal",
  },
  "zero-shot-object-detection": {
    "tokenizer": AutoTokenizer,
    "pipeline": ZeroShotObjectDetectionPipeline,
    "model": AutoModelForZeroShotObjectDetection,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "google/owlvit-base-patch32",
      "model": "Xenova/owlvit-base-patch32",
    },
    "type": "multimodal",
  },
  "document-question-answering": {
    "tokenizer": AutoTokenizer,
    "pipeline": DocumentQuestionAnsweringPipeline,
    "model": AutoModelForDocumentQuestionAnswering,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "naver-clova-ix/donut-base-finetuned-docvqa",
      "model": "Xenova/donut-base-finetuned-docvqa",
    },
    "type": "multimodal",
  },
  "image-to-image": {
    // no tokenizer
    "pipeline": ImageToImagePipeline,
    "model": AutoModelForImageToImage,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "caidas/swin2SR-classical-sr-x2-64",
      "model": "Xenova/swin2SR-classical-sr-x2-64",
    },
    "type": "image",
  },
  "depth-estimation": {
    // no tokenizer
    "pipeline": DepthEstimationPipeline,
    "model": AutoModelForDepthEstimation,
    "processor": AutoProcessor,
    "default": {
      // TODO: replace with original
      // "model": "Intel/dpt-large",
      "model": "Xenova/dpt-large",
    },
    "type": "image",
  },

  // This task serves as a useful interface for dealing with sentence-transformers (https://huggingface.co/sentence-transformers).
  "feature-extraction": {
    "tokenizer": AutoTokenizer,
    "pipeline": FeatureExtractionPipeline,
    "model": AutoModel,
    "default": {
      // TODO: replace with original
      // "model": "sentence-transformers/all-MiniLM-L6-v2",
      "model": "Xenova/all-MiniLM-L6-v2",
    },
    "type": "text",
  },
  "image-feature-extraction": {
    "processor": AutoProcessor,
    "pipeline": ImageFeatureExtractionPipeline,
    "model": [AutoModelForImageFeatureExtraction, AutoModel],
    "default": {
      // TODO: replace with original
      // "model": "google/vit-base-patch16-224",
      "model": "Xenova/vit-base-patch16-224-in21k",
    },
    "type": "image",
  },
} as const

export type SUPPORTED_TASKS_TYPES =  keyof typeof SUPPORTED_TASKS
