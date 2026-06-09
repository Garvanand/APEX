import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
import os
import onnx
from onnxmltools.convert import convert_xgboost
from onnxmltools.convert.common.data_types import FloatTensorType

def main():
    print("Loading dataset...")
    data_path = os.path.join(os.path.dirname(__file__), 'scbd_dataset.csv')
    df = pd.read_csv(data_path)
    
    X = df.drop('label', axis=1)
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Multi-class model...")
    model = xgb.XGBClassifier(
        objective='multi:softprob',
        num_class=4,
        max_depth=5,
        learning_rate=0.1,
        n_estimators=100,
        random_state=42
    )
    
    model.fit(X_train.values, y_train)
    
    # Save standard XGBoost model
    model_path = os.path.join(os.path.dirname(__file__), 'xgboost_state_model.json')
    model.save_model(model_path)
    print(f"Saved standard model to {model_path}")
    
    # Convert to ONNX for Node.js ingestion
    print("Converting model to ONNX...")
    initial_types = [('float_input', FloatTensorType([None, X.shape[1]]))]
    onnx_model = convert_xgboost(model, initial_types=initial_types, target_opset=12)
    
    onnx_path = os.path.join(os.path.dirname(__file__), 'xgboost_state_model.onnx')
    onnx.save_model(onnx_model, onnx_path)
    print(f"Saved ONNX model to {onnx_path}")

if __name__ == "__main__":
    main()
