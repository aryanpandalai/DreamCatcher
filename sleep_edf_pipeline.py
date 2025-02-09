"""
sleep_edf_autoencoder_pipeline.py

This script processes multiple Sleep-EDF file pairs (PSG and Hypnogram) by:
  1. Loading and preprocessing EEG data,
  2. Extracting REM epochs,
  3. Extracting EEG features (band power in standard frequency bands),
  4. Training a deeper autoencoder to learn a richer latent representation,
  5. Clustering the latent representations into 4 clusters,
  6. Mapping each cluster to one of 4 predetermined candidate prompts,
  7. For a sample epoch, determining its cluster and using the corresponding prompt,
  8. Generating a dream image using Stable Diffusion from that prompt,
  9. Displaying and saving the generated image,
  10. Providing an AI-powered insight based on the candidate prompt.

Simply update the FILE_PAIRS list with your actual file paths, then hit “Run.”
"""

import os
import logging
import numpy as np
import mne
import scipy.signal as signal
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.cluster import KMeans
from diffusers import StableDiffusionPipeline

# =============================================================================
# USER-EDITABLE VARIABLES (Update these with your actual file paths)
# =============================================================================

FILE_PAIRS = [
    ("/Users/aryanpandalai/Downloads/DreamDecoderProject_TartanHacks/sleep-edf-database-expanded-1.0.0/sleep-cassette/SC4312E0-PSG.edf",
     "/Users/aryanpandalai/Downloads/DreamDecoderProject_TartanHacks/sleep-edf-database-expanded-1.0.0/sleep-cassette/SC4312EM-Hypnogram.edf")
]

# =============================================================================
# Configuration Parameters
# =============================================================================

# EEG processing parameters
FILTER_PARAMS = {
    'lowcut': 0.5,
    'highcut': 30.0,
    'fs': 256,  # Sampling frequency (Hz); adjust if needed
    'order': 4
}
EPOCH_LENGTH = 30.0  # seconds per epoch
EEG_CHANNELS = ['EEG Fpz-Cz', 'EEG Pz-Oz']  # Adjust based on your data's channel names

# Autoencoder parameters
AUTOENCODER_EPOCHS = 150  # Increased epochs for better learning
LEARNING_RATE = 1e-4  # Lower learning rate for smoother convergence
BATCH_SIZE = 16
LATENT_DIM = 64  # Increased latent dimension to capture more nuance
NUM_CHANNELS = len(EEG_CHANNELS)
NUM_BANDS = 4  # delta, theta, alpha, beta
FEATURE_DIM = NUM_CHANNELS * NUM_BANDS

# Clustering parameters
NUM_CLUSTERS = 4  # Using 4 clusters

# Candidate prompts for each cluster (manually defined)
CANDIDATE_PROMPTS = {
    0: "A surreal calm dreamscape with soft pastel colors.",
    1: "A vibrant, energetic dream filled with dynamic patterns.",
    2: "A dark, mysterious dream with deep, shadowy tones.",
    3: "A whimsical dream with playful, abstract imagery."
}

# AI-powered insight mapping for each candidate prompt
INSIGHT_MAPPING = {
    "A surreal calm dreamscape with soft pastel colors.": "Your mind appears to be seeking tranquility and balance, indicating a desire for calm and serenity.",
    "A vibrant, energetic dream filled with dynamic patterns.": "Your subconscious seems charged with creative energy and passion, possibly signaling bursts of inspiration.",
    "A dark, mysterious dream with deep, shadowy tones.": "There may be hidden, unresolved emotions at play, suggesting a period of introspection or mystery.",
    "A whimsical dream with playful, abstract imagery.": "Your inner thoughts might be exploring a playful and imaginative realm, filled with light-hearted creativity."
}

# For image generation with Stable Diffusion
SD_MODEL = "CompVis/stable-diffusion-v1-4"
NUM_INFERENCE_STEPS = 50

# =============================================================================
# Logging Configuration
# =============================================================================

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


# =============================================================================
# Data Loading and Preprocessing Functions
# =============================================================================

def load_sleepedf_psg(psg_file):
    try:
        raw = mne.io.read_raw_edf(psg_file, preload=True, verbose=False)
        logging.info(f"Loaded PSG file: {psg_file}")
        return raw
    except Exception as e:
        logging.error(f"Error loading PSG EDF file: {e}")
        raise


def load_hypnogram(hypno_file):
    try:
        annotations = mne.read_annotations(hypno_file)
        logging.info(f"Loaded Hypnogram file: {hypno_file}")
        return annotations
    except Exception as e:
        logging.error(f"Error loading hypnogram EDF file: {e}")
        raise


def combine_psg_and_hypnogram(raw, annotations):
    try:
        raw.set_annotations(annotations)
        logging.info("Attached hypnogram annotations to PSG data.")
        return raw
    except Exception as e:
        logging.error(f"Error setting annotations: {e}")
        raise


def preprocess_raw(raw, channels):
    try:
        raw.pick_channels(channels)
        raw.filter(FILTER_PARAMS['lowcut'], FILTER_PARAMS['highcut'],
                   fir_design='firwin', verbose=False)
        logging.info("Preprocessing complete: channels selected and filtered.")
        return raw
    except Exception as e:
        logging.error(f"Error during preprocessing: {e}")
        raise


def extract_rem_epochs(raw, epoch_length=EPOCH_LENGTH):
    try:
        logging.info("Extracting REM epochs from hypnogram annotations...")
        annotations = raw.annotations
        logging.info(f"Annotation descriptions: {annotations.description}")
        valid_rem_labels = ["SLEEP STAGE R"]  # REM epochs are labeled as "Sleep stage R"
        rem_indices = [i for i, desc in enumerate(annotations.description) if desc.upper() in valid_rem_labels]
        sfreq = raw.info['sfreq']
        rem_epochs = []
        for i in rem_indices:
            onset = annotations.onset[i]
            start_sample = int(onset * sfreq)
            end_sample = int((onset + epoch_length) * sfreq)
            if end_sample <= raw.n_times:
                epoch_data = raw[:, start_sample:end_sample][0]
                rem_epochs.append(epoch_data)
        logging.info(f"Extracted {len(rem_epochs)} REM epochs.")
        return rem_epochs, sfreq
    except Exception as e:
        logging.error(f"Error extracting REM epochs: {e}")
        raise


def process_eeg_data(eeg_data, sfreq):
    frequency_bands = {
        'delta': (0.5, 4),
        'theta': (4, 8),
        'alpha': (8, 12),
        'beta': (12, 30)
    }
    features = []
    for band, (low, high) in frequency_bands.items():
        b, a = signal.butter(FILTER_PARAMS['order'], [low / (sfreq / 2), high / (sfreq / 2)], btype='band')
        filtered = signal.filtfilt(b, a, eeg_data, axis=1)
        band_power = np.mean(filtered ** 2, axis=1)
        features.extend(band_power.tolist())
    return np.array(features)


# =============================================================================
# Advanced Autoencoder Model Definition (Deeper Architecture with Dropout)
# =============================================================================

class EEGAutoencoder(nn.Module):
    def __init__(self, input_dim, latent_dim):
        super(EEGAutoencoder, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, input_dim)
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstruction = self.decoder(latent)
        return reconstruction, latent


def train_autoencoder(model, data, num_epochs=AUTOENCODER_EPOCHS, batch_size=BATCH_SIZE, lr=LEARNING_RATE):
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()

    model.train()
    num_samples = data.shape[0]
    for epoch in range(num_epochs):
        permutation = np.random.permutation(num_samples)
        epoch_loss = 0.0
        for i in range(0, num_samples, batch_size):
            indices = permutation[i:i + batch_size]
            batch_data = torch.tensor(data[indices], dtype=torch.float32)
            optimizer.zero_grad()
            reconstruction, _ = model(batch_data)
            loss = criterion(reconstruction, batch_data)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * batch_data.size(0)
        epoch_loss /= num_samples
        if epoch % 5 == 0:
            logging.info(f"Autoencoder Epoch {epoch}: Loss = {epoch_loss:.4f}")
    return model


# =============================================================================
# Clustering and Prompt Generation (with Fallback)
# =============================================================================

def cluster_latents(latents, num_clusters=NUM_CLUSTERS):
    effective_clusters = min(num_clusters, latents.shape[0])
    kmeans = KMeans(n_clusters=effective_clusters, random_state=42)
    labels = kmeans.fit_predict(latents)
    unique_labels = np.unique(labels)
    counts = {i: np.sum(labels == i) for i in unique_labels}
    logging.info(f"KMeans cluster distribution: {counts}")
    if len(unique_labels) == 1:
        logging.info("KMeans resulted in only one cluster. Trying Gaussian Mixture Model.")
        from sklearn.mixture import GaussianMixture
        gmm = GaussianMixture(n_components=effective_clusters, random_state=42)
        labels = gmm.fit_predict(latents)
        unique_labels = np.unique(labels)
        counts = {i: np.sum(labels == i) for i in unique_labels}
        logging.info(f"GMM cluster distribution: {counts}")
    return labels, kmeans


def assign_prompt(cluster_label, candidate_prompts=CANDIDATE_PROMPTS):
    return candidate_prompts.get(cluster_label, "A mysterious dream with undefined features.")


# =============================================================================
# Dream Image Generation (Using Stable Diffusion)
# =============================================================================

def generate_dream_image(prompt, num_inference_steps=NUM_INFERENCE_STEPS):
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        pipe = StableDiffusionPipeline.from_pretrained(SD_MODEL, torch_dtype=torch.float32)
        pipe = pipe.to(device)
        image = pipe(prompt, num_inference_steps=num_inference_steps).images[0]
        logging.info("Generated dream image using Stable Diffusion.")
        return image
    except Exception as e:
        logging.error(f"Error generating dream image: {e}")
        raise


# =============================================================================
# Main Pipeline (Iterates Over File Pairs)
# =============================================================================

def main():
    for idx, (psg_file, hypno_file) in enumerate(FILE_PAIRS):
        logging.info(f"Processing file pair {idx + 1}:")
        logging.info(f"PSG file: {psg_file}")
        logging.info(f"Hypnogram file: {hypno_file}")

        # 1. Load and combine PSG and Hypnogram data.
        raw = load_sleepedf_psg(psg_file)
        annotations = load_hypnogram(hypno_file)
        raw = combine_psg_and_hypnogram(raw, annotations)

        # 2. Preprocess the raw data.
        raw = preprocess_raw(raw, EEG_CHANNELS)

        # 3. Extract REM epochs.
        rem_epochs, sfreq = extract_rem_epochs(raw, EPOCH_LENGTH)
        if len(rem_epochs) == 0:
            logging.error("No REM epochs found for this file pair. Skipping to next.")
            continue

        # 4. Extract features for each REM epoch.
        features_list = [process_eeg_data(epoch, sfreq) for epoch in rem_epochs]
        features_array = np.vstack(features_list)
        logging.info(f"Extracted feature dataset with shape: {features_array.shape}")

        # 5. Train the autoencoder on the feature dataset.
        autoencoder = EEGAutoencoder(input_dim=FEATURE_DIM, latent_dim=LATENT_DIM)
        logging.info("Training autoencoder on EEG features...")
        autoencoder = train_autoencoder(autoencoder, features_array)

        # 6. Obtain latent representations.
        autoencoder.eval()
        with torch.no_grad():
            data_tensor = torch.tensor(features_array, dtype=torch.float32)
            _, latents = autoencoder(data_tensor)
        latents_np = latents.cpu().numpy()

        # 7. Cluster the latent representations.
        cluster_labels, kmeans_model = cluster_latents(latents_np)

        # 8. For demonstration, select a random sample and assign a candidate prompt.
        sample_idx = np.random.randint(0, features_array.shape[0])
        sample_latent = latents_np[sample_idx]
        sample_cluster = kmeans_model.predict(sample_latent.reshape(1, -1))[0]
        candidate_prompt = assign_prompt(sample_cluster)
        logging.info(f"Selected sample belongs to cluster {sample_cluster}. Assigned prompt: {candidate_prompt}")

        # 9. Generate a dream image from the candidate prompt.
        dream_image = generate_dream_image(candidate_prompt)

        # 10. Display the generated image.
        plt.figure(figsize=(8, 8))
        plt.imshow(dream_image)
        plt.title(f"Generated Dream Image for File Pair {idx + 1}")
        plt.axis("off")
        plt.show()

        # 11. Save the image.
        output_image_path = f"generated_dream_image_pair_{idx + 1}.png"
        dream_image.save(output_image_path)
        logging.info(f"Dream image saved at: {output_image_path}")

        # 12. Provide AI-powered insight based on the candidate prompt.
        insight = INSIGHT_MAPPING.get(candidate_prompt,
                                      "Your subconscious contains intriguing mysteries waiting to be explored.")
        logging.info(f"AI-Powered Insight: {insight}")
        print(f"AI-Powered Insight: {insight}")


if __name__ == "__main__":
    main()
