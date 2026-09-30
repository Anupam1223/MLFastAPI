import React from 'react';
import ChapterDeck from '../components/ChapterDeck';
import {
  MemoryToDiskVisualizer,
  DocumentAnalogyVisualizer,
  LibraryCompareVisualizer,
  PickleWalkthroughVisualizer,
  PickleSecurityVisualizer,
  JoblibVisualizer,
  FrameworkFormatsVisualizer,
} from '../components/SerializationBasicsVisualizers';
import { VersionCompatVisualizer, ModelSizeVisualizer, WhatToSerializeVisualizer } from '../components/SerializationConcernsVisualizers';
import {
  GlobalLoadVisualizer,
  LazyLoadVisualizer,
  LifespanVisualizer,
  StrategyCompareVisualizer,
  LoadFailureVisualizer,
  MemoryFootprintVisualizer,
} from '../components/SerializationLoadingVisualizers';

export const meta = {
  title: 'Serializing and Deserializing ML Models (Part 1)',
  subtitle: 'Saving model artifacts, and loading them into a FastAPI app',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;

const Pre = ({ children }) => (
  <pre className="font-mono text-[11px] leading-relaxed bg-gray-950/80 border border-gray-700 rounded-lg p-3 text-teal-100 overflow-x-auto">
    {children}
  </pre>
);

const Box = ({ title, tone = 'teal', children }) => {
  const border = {
    teal: 'border-l-teal-400',
    amber: 'border-l-amber-400',
    violet: 'border-l-violet-400',
    cyan: 'border-l-cyan-400',
    rose: 'border-l-rose-400',
    emerald: 'border-l-emerald-400',
    sky: 'border-l-sky-400',
  }[tone];
  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800/30 p-3 border-l-4 ${border} space-y-1.5`}>
      {title && <p className="text-white font-semibold">{title}</p>}
      {children}
    </div>
  );
};

const Hint = ({ children }) => <p className="text-xs text-gray-400">{children}</p>;

const slidesData = [
  {
    id: 'what',
    title: 'Serializing and Deserializing ML Models',
    subtitle: 'A trained model only exists in memory',
    Visual: MemoryToDiskVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Trained machine learning models exist only in a computer’s memory during their active session. To use this trained model
          later, especially within a separate application like a web API, you need a way to{' '}
          <strong className="text-white">save its learned state</strong> and then <strong className="text-white">load it back</strong>{' '}
          when needed.
        </p>
        <Box title="The two directions" tone="teal">
          <p>
            Converting the in-memory model object into a format that can be stored on disk or transmitted is called{' '}
            <strong className="text-white">serialization</strong>, and the reverse process of reconstructing the object from the
            stored format is called <strong className="text-white">deserialization</strong>.
          </p>
        </Box>
        <Hint>Step through a model’s life on the right, then turn saving off and restart the process.</Hint>
      </div>
    ),
  },
  {
    id: 'analogy',
    title: 'Like Saving a Document',
    subtitle: 'Preserve the learned parameters, structure, and the rest',
    Visual: DocumentAnalogyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Think of it like saving a document you’re working on. You save it to a file (serialize) so you can close the application
          and open the exact same document later (deserialize) without losing your work.
        </p>
        <p>
          For ML models, “saving the work” means preserving the <strong className="text-white">learned parameters</strong>,{' '}
          <strong className="text-white">structure</strong>, and any other necessary information captured during training.
        </p>
        <Hint>Step through save, close and reopen. Click a row to match a document part to a model part.</Hint>
      </div>
    ),
  },
  {
    id: 'libraries',
    title: 'Common Serialization Libraries',
    subtitle: 'pickle and joblib',
    Visual: LibraryCompareVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Python offers several ways to serialize objects. For machine learning models, two libraries are particularly common:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            <C>pickle</C>: Python’s built-in module for object serialization. It can serialize almost any Python object, including
            complex objects like trained scikit-learn models.
          </li>
          <li>
            <C>joblib</C>: A library that provides utilities for pipelining Python jobs. It includes replacements for <C>pickle</C>{' '}
            (<C>joblib.dump</C> and <C>joblib.load</C>) that are often more efficient for objects containing large NumPy arrays,
            which are very common in machine learning models, particularly those from scikit-learn.
          </li>
        </ol>
        <Hint>Pick an object on the right and compare what each library writes.</Hint>
      </div>
    ),
  },
  {
    id: 'pickle',
    title: 'Using pickle',
    subtitle: 'dump to write, load to read',
    Visual: PickleWalkthroughVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Let’s see how you might save a simple scikit-learn model using <C>pickle</C>. Assume you have a trained model object named{' '}
          <C>model</C>:
        </p>
        <Pre>{`import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# --- Training a Dummy Model (Illustrative) ---
X, y = make_classification(n_samples=100, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)
# --- Model is now 'trained' ---

# Define the filename for the saved model
model_filename = 'logistic_regression_model.pkl'

# Serialize (save) the model to a file
# 'wb' mode opens the file for writing in binary mode
with open(model_filename, 'wb') as file:
    pickle.dump(model, file)

print(f"Model saved to {model_filename}")

# --- Later, in a different script or session ---

# Deserialize (load) the model from the file
# 'rb' mode opens the file for reading in binary mode
try:
    with open(model_filename, 'rb') as file:
        loaded_model = pickle.load(file)
    print(f"Model loaded from {model_filename}")
    # Now you can use loaded_model to make predictions
    # Example: predictions = loaded_model.predict(X_test)
except FileNotFoundError:
    print(f"Error: Model file '{model_filename}' not found.")
except Exception as e:
    print(f"Error loading model: {e}")`}</Pre>
        <Hint>Step through the script, then delete or truncate the file before the later session.</Hint>
      </div>
    ),
  },
  {
    id: 'security',
    title: 'Security Note',
    subtitle: 'Loading a pickle executes code inside it',
    Visual: PickleSecurityVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="pickle is powerful, and that is the risk" tone="rose">
          <p>
            Deserializing a pickle file involves <strong className="text-white">executing code embedded within the file</strong>.
            Never load a pickle file from an untrusted or unauthenticated source, as it could contain malicious code.{' '}
            <C>joblib</C> shares similar security risks.
          </p>
        </Box>
        <Hint>Step through loading your own file, then the same steps on a file from an unknown download.</Hint>
      </div>
    ),
  },
  {
    id: 'joblib',
    title: 'Using joblib',
    subtitle: 'The recommended choice for scikit-learn',
    Visual: JoblibVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          <C>joblib</C> is often preferred for scikit-learn models because it can handle large NumPy arrays more efficiently,
          potentially resulting in smaller file sizes and faster load times compared to <C>pickle</C>. The interface is very similar:
        </p>
        <Pre>{`import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# --- Training a Dummy Model (Illustrative) ---
X, y = make_classification(n_samples=100, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)
# --- Model is now 'trained' ---

# Define the filename for the saved model
model_filename_joblib = 'logistic_regression_model.joblib'

# Serialize (save) the model using joblib
joblib.dump(model, model_filename_joblib)
print(f"Model saved to {model_filename_joblib}")

# --- Later, in a different script or session ---

# Deserialize (load) the model using joblib
try:
    loaded_model_joblib = joblib.load(model_filename_joblib)
    print(f"Model loaded from {model_filename_joblib}")
    # Now you can use loaded_model_joblib to make predictions
    # Example: predictions = loaded_model_joblib.predict(X_test)
except FileNotFoundError:
    print(f"Error: Model file '{model_filename_joblib}' not found.")
except Exception as e:
    print(f"Error loading model: {e}")`}</Pre>
        <p>
          For most scikit-learn use cases, <strong className="text-white">joblib is a recommended choice</strong>.
        </p>
        <Hint>Step through the lines that change when the pickle script becomes a joblib script.</Hint>
      </div>
    ),
  },
  {
    id: 'formats',
    title: 'Library-Specific Formats',
    subtitle: 'Keras and PyTorch save their own way',
    Visual: FrameworkFormatsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While <C>pickle</C> and <C>joblib</C> are general Python serialization tools, many machine learning libraries provide their
          own dedicated functions or formats for saving and loading models.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-white">TensorFlow/Keras:</strong> Often uses the SavedModel format or <C>.h5</C> (HDF5) files via{' '}
            <C>model.save()</C> and <C>tf.keras.models.load_model()</C>. These formats store not just the model weights but also the
            model architecture and training configuration.
          </li>
          <li>
            <strong className="text-white">PyTorch:</strong> Typically uses <C>.pt</C> or <C>.pth</C> file extensions. PyTorch allows
            saving the entire model (<C>torch.save(model, PATH)</C>) or just the learned parameters (the state dictionary —{' '}
            <C>torch.save(model.state_dict(), PATH)</C>), which is often preferred for flexibility. Loading is done via{' '}
            <C>torch.load()</C>.
          </li>
        </ul>
        <p>
          When using these frameworks, it’s generally best practice to use their{' '}
          <strong className="text-white">native saving/loading mechanisms</strong>, as they are optimized for the specific structures
          and requirements of those libraries and often handle compatibility across versions more gracefully.
        </p>
        <Hint>Switch frameworks on the right, and for PyTorch compare saving the whole model with saving only the state dict.</Hint>
      </div>
    ),
  },
  {
    id: 'versions',
    title: 'Version Compatibility',
    subtitle: 'The serving environment must match training',
    Visual: VersionCompatVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          This is a significant challenge. A model serialized with one version of a library (e.g., scikit-learn 1.0) might not load
          correctly using a different version (e.g., scikit-learn 1.2).
        </p>
        <Box title="Match the environments" tone="amber">
          <p>
            Ensure that the Python environment and library versions used for loading the model in your FastAPI application{' '}
            <strong className="text-white">match the environment where the model was originally trained and saved</strong>. This is one
            reason containerization (covered in Chapter 6) is so valuable.
          </p>
        </Box>
        <Hint>Change the two scikit-learn versions, then containerize so they can’t drift.</Hint>
      </div>
    ),
  },
  {
    id: 'size',
    title: 'File Size',
    subtitle: 'Artifacts can be megabytes or gigabytes',
    Visual: ModelSizeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Trained models, especially deep learning models, can result in{' '}
          <strong className="text-white">large artifact files</strong> (megabytes or even gigabytes).
        </p>
        <p>
          Examine <strong className="text-white">storage implications</strong> and the potential impact on{' '}
          <strong className="text-white">application startup time</strong> if models are loaded on demand.
        </p>
        <Hint>Pick a model and the disk it is read from. The bar is on a log scale.</Hint>
      </div>
    ),
  },
  {
    id: 'what-to-save',
    title: 'What to Serialize',
    subtitle: 'The model, or the model plus its preprocessing',
    Visual: WhatToSerializeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Typically, you serialize the final, trained model object.</p>
        <Box title="When preprocessing is separate" tone="sky">
          <p>
            If your prediction pipeline involves separate preprocessing steps (like scaling or encoding), you might serialize a
            scikit-learn <C>Pipeline</C> object that includes both the preprocessing steps and the model, ensuring the{' '}
            <strong className="text-white">exact same transformations</strong> are applied during prediction as during training.
          </p>
        </Box>
        <p>Alternatively, preprocessing logic might be reimplemented directly within your FastAPI application code.</p>
        <p>
          Successfully serializing your model is the first essential step. The next step, covered in the following slides, is to load
          this serialized artifact into your running FastAPI application so it’s ready to serve predictions through your API endpoints.
        </p>
        <Hint>Compare saving only the model with saving the whole Pipeline, and drag the app’s copy of the training mean.</Hint>
      </div>
    ),
  },
  {
    id: 'startup-global',
    title: 'Loading Models at Startup',
    subtitle: 'A global variable, loaded when the module is imported',
    Visual: GlobalLoadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Loading a serialized machine learning model into a running FastAPI application is essential for enabling predictions. The
          method of loading a model significantly impacts an application’s <strong className="text-white">startup time</strong>,{' '}
          <strong className="text-white">memory usage</strong>, and the <strong className="text-white">latency of the first prediction request</strong>.
        </p>
        <p>
          The most straightforward approach is often to load the model when the application first starts. This means the model is
          ready in memory before the first request arrives, ensuring consistent prediction latency. The primary cost is a potentially
          slower application startup time, as loading the model becomes part of the initialization process.
        </p>
        <p>A simple method is to load the model into a global variable in your main application file.</p>
        <Pre>{`# main.py
import joblib
from fastapi import FastAPI

app = FastAPI()

# Load the model when the module is imported (at startup)
try:
    model = joblib.load("models/sentiment_model.pkl")
    # You might also load related objects like vectorizers
    vectorizer = joblib.load("models/tfidf_vectorizer.pkl")
    print("Model loaded successfully at startup.")
except FileNotFoundError:
    print("Error: Model file not found. Ensure 'models/sentiment_model.pkl' exists.")
    model = None # Handle the absence of the model gracefully
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.post("/predict")
async def predict_sentiment(text: str):
    if model is None:
        # Return an error if the model failed to load
        raise HTTPException(status_code=503, detail="Model is not available")

    # Assume preprocessing and prediction logic here
    # features = vectorizer.transform([text])
    # prediction = model.predict(features)
    # return {"text": text, "sentiment_prediction": prediction[0]}
    # Placeholder for demonstration
    return {"text": text, "sentiment_prediction": "positive"} # Replace with actual logic

# Note: For simplicity, input/output validation with Pydantic is omitted here,
# but you should use it as covered in Chapter 2.`}</Pre>
        <p>
          While simple, using global variables directly can sometimes make{' '}
          <strong className="text-white">testing and managing application state more complex</strong>, especially in larger applications.
        </p>
        <p className="text-xs text-gray-400">
          The snippet calls <C>HTTPException</C> without importing it. Add it: <C>from fastapi import FastAPI, HTTPException</C>.
        </p>
        <Hint>Make the file missing or unreadable and follow the request to a 503.</Hint>
      </div>
    ),
  },
  {
    id: 'lazy',
    title: 'Loading Models On Demand',
    subtitle: 'Lazy loading with functools.lru_cache',
    Visual: LazyLoadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Alternatively, you might load the model only when the first prediction request arrives. This approach, often called “lazy
          loading,” results in a <strong className="text-white">faster application startup</strong> because the model isn’t loaded
          immediately. However, the first request that triggers the model loading will experience{' '}
          <strong className="text-white">higher latency</strong>.
        </p>
        <p>
          To avoid reloading the model on every subsequent request, you typically combine lazy loading with some form of caching.
          Python’s <C>functools.lru_cache</C> is a convenient way to achieve this for functions that load resources.
        </p>
        <Pre>{`# main_lazy.py
import joblib
from fastapi import FastAPI, HTTPException
from functools import lru_cache

app = FastAPI()

@lru_cache(maxsize=1) # Cache the result of this function
def get_model():
    print("Attempting to load model (lazy)...")
    try:
        model = joblib.load("models/sentiment_model.pkl")
        print("Model loaded successfully.")
        return model
    except FileNotFoundError:
        print("Error: Model file not found during lazy load.")
        return None # Indicate failure
    except Exception as e:
        print(f"Error lazy loading model: {e}")
        return None

@app.post("/predict")
async def predict_sentiment(text: str):
    model = get_model() # Function call triggers loading only once
    if model is None:
        raise HTTPException(status_code=503, detail="Model could not be loaded")

    # Placeholder for prediction logic
    # features = ... # Assuming vectorizer is also loaded, perhaps via another cached function
    # prediction = model.predict(features)
    # return {"text": text, "sentiment_prediction": prediction[0]}
    return {"text": text, "sentiment_prediction": "positive"} # Replace with actual logic`}</Pre>
        <p>
          <C>lru_cache(maxsize=1)</C> ensures <C>get_model</C> is executed only once. Subsequent calls will return the cached result
          (the loaded model object or <C>None</C> if loading failed) without re-executing the loading logic.
        </p>
        <Box title="Lazy loading is beneficial if" tone="teal">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>The model is very large and takes a long time to load, making fast application startup important.</li>
            <li>The prediction endpoint might not be called frequently, so the cost of loading is only incurred when necessary.</li>
            <li>Memory is constrained, and you want to avoid loading the model unless it’s actually used.</li>
          </ul>
        </Box>
        <Hint>Send three requests. Then make the file missing and notice that None gets cached too.</Hint>
      </div>
    ),
  },
  {
    id: 'lifespan',
    title: 'Using FastAPI Startup Events',
    subtitle: 'The lifespan context manager',
    Visual: LifespanVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI provides <C>lifespan</C> events (or the older <C>startup</C>/<C>shutdown</C> events) that allow you to run code
          before the application starts accepting requests and after it finishes. This is a cleaner place to load resources like ML
          models.
        </p>
        <Pre>{`# main_lifespan.py
import joblib
from fastapi import FastAPI
from contextlib import asynccontextmanager

# Dictionary to hold application state, including the loaded model
app_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run before the application starts
    print("Application startup: Loading model...")
    try:
        app_state["model"] = joblib.load("models/sentiment_model.pkl")
        # Load other artifacts if needed
        # app_state["vectorizer"] = joblib.load("models/tfidf_vectorizer.pkl")
        print("Model loaded successfully.")
    except FileNotFoundError:
        print("Error: Model file not found.")
        app_state["model"] = None
    except Exception as e:
        print(f"Error loading model during startup: {e}")
        app_state["model"] = None
    yield
    # Code to run when the application is shutting down
    print("Application shutdown: Cleaning up resources...")
    app_state.clear()

app = FastAPI(lifespan=lifespan)

@app.post("/predict")
async def predict_sentiment(text: str):
    model = app_state.get("model")
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not available")

    # Placeholder for prediction logic
    # features = app_state["vectorizer"].transform([text])
    # prediction = model.predict(features)
    # return {"text": text, "sentiment_prediction": prediction[0]}
    return {"text": text, "sentiment_prediction": "positive"} # Replace with actual logic`}</Pre>
        <p>
          Using the <C>lifespan</C> context manager is the{' '}
          <strong className="text-white">recommended approach</strong> for managing resources that need to be initialized at startup
          and cleaned up at shutdown. It keeps model loading logic separate from the main application definition and request handling.
        </p>
        <p className="text-xs text-gray-400">
          This snippet also uses <C>HTTPException</C> without importing it. The lifespan function itself is current FastAPI; the older{' '}
          <C>@app.on_event("startup")</C> style still runs but is deprecated.
        </p>
        <Hint>Step from startup through a request to shutdown, and watch app_state fill and then clear.</Hint>
      </div>
    ),
  },
  {
    id: 'compare',
    title: 'Loading Strategy Comparison',
    subtitle: 'Pay at startup, or pay on the first request',
    Visual: StrategyCompareVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="italic text-gray-400">
          Comparison of model loading strategies: Loading at startup incurs delay initially but provides consistent request handling
          times. Lazy loading starts the application faster but adds latency to the first request that requires the model.
        </p>
        <Hint>Play each strategy on the right. The amber step is where someone waits.</Hint>
      </div>
    ),
  },
  {
    id: 'failures',
    title: 'Handling Loading Failures',
    subtitle: 'Missing, corrupted, or incompatible files',
    Visual: LoadFailureVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Regardless of the strategy, it’s essential to handle potential errors during model loading gracefully. Common issues include
          the model file being <strong className="text-white">missing, corrupted, or incompatible</strong> with the current library
          versions. Use <C>try…except</C> blocks around your loading code.
        </p>
        <Box title="What to do with the failure" tone="amber">
          <p>
            If a model fails to load at startup, you might prevent the application from starting entirely or log the error and have
            prediction endpoints return an appropriate error status code (like <strong className="text-white">503 Service Unavailable</strong>).
            If using lazy loading, the endpoint that triggers the load should handle the failure, perhaps by logging the error and
            returning a <strong className="text-white">503</strong> status.
          </p>
        </Box>
        <Hint>Combine a failure with a strategy. For startup, switch between crashing and answering 503.</Hint>
      </div>
    ),
  },
  {
    id: 'memory',
    title: 'Memory Management',
    subtitle: 'Loaded models raise the baseline',
    Visual: MemoryFootprintVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Machine learning models, especially deep learning models, can consume{' '}
          <strong className="text-white">significant amounts of memory</strong>. Keep this in mind when choosing a loading strategy and
          deploying your application.
        </p>
        <p>
          Loading large models at startup increases the application’s <strong className="text-white">baseline memory footprint</strong>.
          Ensure your deployment environment has sufficient RAM to accommodate the model(s) you intend to serve.
        </p>
        <p>
          In the following sections, we will build upon these loading techniques as we create the actual prediction endpoints and
          explore how FastAPI’s dependency injection system can further refine how models are provided to your request handlers.
        </p>
        <Hint>Turn models on, shrink the machine’s RAM, and compare startup loading with lazy loading before any request.</Hint>
      </div>
    ),
  },
];

export default function SerializingAndDeserializingMLModelsPartOne() {
  return <ChapterDeck slides={slidesData} />;
}
