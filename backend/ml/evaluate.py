import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, f1_score
import matplotlib.pyplot as plt
import seaborn as sns
import os

def main():
    print("Loading dataset and model...")
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, 'scbd_dataset.csv')
    model_path = os.path.join(base_dir, 'xgboost_state_model.json')
    
    df = pd.read_csv(data_path)
    X = df.drop('label', axis=1)
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier()
    model.load_model(model_path)
    
    print("Evaluating Model...")
    y_pred = model.predict(X_test.values)
    
    print("\nClassification Report:")
    target_names = ['Flow', 'Distracted', 'Fatigued', 'Overloaded']
    print(classification_report(y_test, y_pred, target_names=target_names))
    
    f1 = f1_score(y_test, y_pred, average='weighted')
    print(f"Weighted F1-Score: {f1:.4f}")
    
    # Plot Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=target_names, yticklabels=target_names)
    plt.title('Cognitive State Confusion Matrix')
    plt.ylabel('Actual State')
    plt.xlabel('Predicted State')
    
    cm_path = os.path.join(base_dir, 'confusion_matrix.png')
    plt.savefig(cm_path)
    print(f"Saved Confusion Matrix to {cm_path}")
    
    # Plot Feature Importance
    plt.figure(figsize=(8, 6))
    xgb.plot_importance(model, importance_type='weight')
    plt.title('Feature Importance (Weight)')
    plt.tight_layout()
    fi_path = os.path.join(base_dir, 'feature_importance.png')
    plt.savefig(fi_path)
    print(f"Saved Feature Importance to {fi_path}")

if __name__ == "__main__":
    main()
