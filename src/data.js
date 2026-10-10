// HAM10000 (Tschandl et al., 2018) 7 diagnostic classes
export const CLASSES = [
  { id: "mel",   name: "Melanoma",                    malignant: true,  info: "Most dangerous skin cancer; early detection is critical." },
  { id: "bcc",   name: "Basal cell carcinoma",        malignant: true,  info: "Common, slow-growing cancer; treatable when found early." },
  { id: "akiec", name: "Actinic keratosis / Bowen's", malignant: true,  info: "Pre-cancerous / in-situ lesion that can progress." },
  { id: "nv",    name: "Melanocytic nevus",           malignant: false, info: "Common benign mole." },
  { id: "bkl",   name: "Benign keratosis",            malignant: false, info: "Benign lesion such as seborrheic keratosis." },
  { id: "df",    name: "Dermatofibroma",              malignant: false, info: "Benign fibrous skin nodule." },
  { id: "vasc",  name: "Vascular lesion",             malignant: false, info: "Benign lesion of blood vessels (e.g. angioma)." },
];

// Candidate backbones compared in the literature (Kassani 2019; Esteva 2017; recent EfficientNet work)
export const MODELS = [
  { id: "efficientnet", name: "EfficientNet-B0", note: "Best accuracy/size trade-off (recent work 2021-24)" },
  { id: "resnet50",     name: "ResNet-50",       note: "Strong baseline, used in ISIC ensembles (Codella 2018)" },
  { id: "mobilenet",    name: "MobileNetV2",     note: "Lightweight, best trade-off on HAM10000 (Kassani 2019)" },
];

// How each reference from Review I shaped a UI feature
export const REFERENCES = [
  { cite: "Esteva et al. (2017)",       feature: "Multi-class prediction + confidence",      why: "Deep CNN reached dermatologist-level accuracy, so we show the full class probabilities, not just one label." },
  { cite: "Tschandl et al. (2018)",     feature: "7 HAM10000 classes",                        why: "The public benchmark defines the diagnostic categories and their benign/malignant grouping used in the UI." },
  { cite: "Codella et al. (2018)",      feature: "Model selector",                            why: "ISIC ensembles used ResNet/DenseNet; the UI lets the user switch backbone and compare outputs." },
  { cite: "Brinker et al. (2019)",      feature: "Benign vs Malignant risk banner",           why: "Binary lesion classification is clinically the key decision, so a single risk summary is shown on top." },
  { cite: "Kassani & Kassani (2019)",   feature: "MobileNet / ResNet / EfficientNet options", why: "Compared VGG, ResNet, MobileNet; these backbones are offered as selectable models." },
  { cite: "Recent work (2021-24)",      feature: "Grad-CAM heatmap overlay + opacity slider", why: "Grad-CAM improves interpretability, so every prediction comes with a visual explanation." },
  { cite: "Common gaps (Review I)",     feature: "Imbalance-aware alert + disclaimer",        why: "Melanoma is rare, so the alert uses a lower threshold for it; the disclaimer addresses dataset bias and over-trust." },
];
