import numpy as np
import pandas as pd
import os

# Set seed for reproducibility
np.random.seed(42)

# Parameters
NUM_SAMPLES = 10000

# States: 0 = Flow, 1 = Distracted, 2 = Fatigued, 3 = Overloaded
# Features: sma, jerk_variance, spectral_entropy, touch_density, app_switches

def generate_state_data(state, num_samples):
    if state == 0: # Flow: Low movement, zero touches
        sma = np.random.normal(loc=0.1, scale=0.05, size=num_samples)
        jerk = np.random.normal(loc=0.05, scale=0.02, size=num_samples)
        entropy = np.random.normal(loc=0.5, scale=0.1, size=num_samples)
        touch = np.random.poisson(lam=0.1, size=num_samples)
        app = np.random.poisson(lam=0.0, size=num_samples)
    elif state == 1: # Distracted: High movement, high switches
        sma = np.random.normal(loc=3.5, scale=1.0, size=num_samples)
        jerk = np.random.normal(loc=2.0, scale=0.5, size=num_samples)
        entropy = np.random.normal(loc=1.5, scale=0.3, size=num_samples)
        touch = np.random.poisson(lam=1.5, size=num_samples)
        app = np.random.poisson(lam=2.5, size=num_samples)
    elif state == 2: # Fatigued: Low movement, high touches (doomscrolling)
        sma = np.random.normal(loc=0.3, scale=0.1, size=num_samples)
        jerk = np.random.normal(loc=0.1, scale=0.05, size=num_samples)
        entropy = np.random.normal(loc=0.8, scale=0.2, size=num_samples)
        touch = np.random.poisson(lam=5.0, size=num_samples)
        app = np.random.poisson(lam=0.5, size=num_samples)
    elif state == 3: # Overloaded: Extreme erratic movement, huge touch bursts
        sma = np.random.normal(loc=5.0, scale=1.5, size=num_samples)
        jerk = np.random.normal(loc=4.0, scale=1.0, size=num_samples)
        entropy = np.random.normal(loc=2.0, scale=0.5, size=num_samples)
        touch = np.random.poisson(lam=8.0, size=num_samples)
        app = np.random.poisson(lam=4.0, size=num_samples)
        
    return pd.DataFrame({
        'sma': np.clip(sma, 0, None),
        'jerk_variance': np.clip(jerk, 0, None),
        'spectral_entropy': np.clip(entropy, 0, None),
        'touch_density': np.clip(touch, 0, None),
        'app_switches': np.clip(app, 0, None),
        'label': state
    })

if __name__ == "__main__":
    print("Generating SCBD Synthetic Dataset...")
    samples_per_state = NUM_SAMPLES // 4
    
    df_flow = generate_state_data(0, samples_per_state)
    df_distracted = generate_state_data(1, samples_per_state)
    df_fatigued = generate_state_data(2, samples_per_state)
    df_overloaded = generate_state_data(3, samples_per_state)
    
    df = pd.concat([df_flow, df_distracted, df_fatigued, df_overloaded]).sample(frac=1).reset_index(drop=True)
    
    output_path = os.path.join(os.path.dirname(__file__), 'scbd_dataset.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated with {len(df)} samples: {output_path}")
