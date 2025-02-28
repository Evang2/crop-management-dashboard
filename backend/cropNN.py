import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.regularizers import l2
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns  # Import Seaborn for visualization
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc, precision_recall_fscore_support

# Load the dataset
data = pd.read_csv('Cropdata.csv')

# Preprocess the data
le = LabelEncoder()
data['label'] = le.fit_transform(data['label'])
X = data.drop('label', axis=1)
y = data['label']

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build the Neural Network Model
model = Sequential([
    Dense(128, activation='relu', kernel_regularizer=l2(0.01), input_shape=(X_train.shape[1],)),
    BatchNormalization(),
    Dropout(0.5),
    Dense(64, activation='relu', kernel_regularizer=l2(0.01)),
    BatchNormalization(),
    Dropout(0.5),
    Dense(len(le.classes_), activation='softmax')
])

# Compile the model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Callbacks
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=0.00001)

# Train the Model
history = model.fit(X_train, y_train, epochs=100, batch_size=16, validation_split=0.2,
                    callbacks=[early_stopping, reduce_lr])

# Evaluate the Model
loss, accuracy = model.evaluate(X_test, y_test)
print(f'Test Accuracy: {accuracy:.2f}')

# Save the model
model.save('crop_recommendation_model.h5')

# Make Predictions
y_test_pred = model.predict(X_test)
y_test_classes = np.argmax(y_test_pred, axis=1)

# Confusion Matrix and Classification Report
conf_matrix = confusion_matrix(y_test, y_test_classes)
print("Classification Report:")
print(classification_report(y_test, y_test_classes, target_names=le.classes_))

# ---------------- Training History Visualization ---------------- #
plt.figure(figsize=(14, 6))

# Accuracy Plot
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

# Loss Plot
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.show()

# ---------------- Precision, Recall, F1-Score Visualization ---------------- #
precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_test_classes, average=None)
metrics = ['Precision', 'Recall', 'F1-Score']
values = [precision, recall, f1]

for metric, val in zip(metrics, values):
    plt.figure(figsize=(12, 6))
    sns.barplot(x=le.classes_, y=val, palette="viridis")
    plt.title(f'{metric} per Class')
    plt.xlabel('Classes')
    plt.ylabel(metric)
    plt.xticks(rotation=45, ha="right", fontsize=10)
    plt.ylim(0, 1)
    plt.show()

# ---------------- Confusion Matrix Visualization ---------------- #
plt.figure(figsize=(14, 10))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='YlGnBu', 
            xticklabels=le.classes_, yticklabels=le.classes_,
            cbar_kws={'label': 'Scale'}, annot_kws={"size": 8})  # Reduce annotation size
plt.xticks(rotation=45, fontsize=10)
plt.yticks(fontsize=10)
plt.title('Confusion Matrix', fontsize=16)
plt.xlabel('Predicted Label', fontsize=14)
plt.ylabel('True Label', fontsize=14)
plt.tight_layout()
plt.show()

# ---------------- ROC-AUC Curve for Each Class ---------------- #
plt.figure(figsize=(12, 8))
n_classes = len(le.classes_)
for i in range(n_classes):
    y_test_binary = (y_test == i).astype(int)
    y_score = model.predict(X_test)[:, i]
    fpr, tpr, _ = roc_curve(y_test_binary, y_score)
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'Class {le.classes_[i]} (AUC = {roc_auc:.2f})')

plt.plot([0, 1], [0, 1], 'k--', label='Random Chance')
plt.title('ROC Curve for Each Class')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend(loc='lower right')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.grid()
plt.show()
