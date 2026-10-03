import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  RawResponseVisualizer,
  ResponseContractVisualizer,
  ProbabilityChartVisualizer,
  OutputShapeVisualizer,
  PrecisionErrorVisualizer,
} from '../components/PredictionResponseVisualizers';
import {
  GlobalCouplingVisualizer,
  DependsFlowVisualizer,
  InjectedPredictVisualizer,
  DependsBenefitsVisualizer,
  StorageLocationVisualizer,
  ConfigLoadVisualizer,
  VersioningVisualizer,
  VersionStrategyVisualizer,
  ProjectTreeVisualizer,
  ArtifactSecurityVisualizer,
  PackagingVisualizer,
} from '../components/ModelAccessVisualizers';

export const meta = {
  title: 'Serializing and Deserializing ML Models (Part 3)',
  subtitle: 'Response models, dependency injection, and model artifacts',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;

const Pre = CodeBlock;

const Box = ({ title, tone = 'teal', children }) => {
  const border = {
    teal: 'border-l-teal-400',
    amber: 'border-l-amber-400',
    rose: 'border-l-rose-400',
    sky: 'border-l-sky-400',
    emerald: 'border-l-emerald-400',
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
    id: 'raw-response',
    title: 'Returning Predictions and Probabilities',
    subtitle: 'Send a JSON object, not a bare value',
    Visual: RawResponseVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Once your machine learning model has processed the input data and generated a prediction, the final step in the
          request-response cycle is to send these results back to the client. How you structure this response is significant for
          usability and integration with downstream applications. Simply returning a raw number or string often isn’t sufficient.
          Clients usually benefit from a well-defined JSON object containing the prediction and potentially other relevant
          information, like confidence scores or probabilities.
        </p>
        <p>
          FastAPI, in conjunction with Pydantic, makes defining and enforcing these response structures straightforward using
          response models.
        </p>
        <Hint>Switch between a raw string and a raw number, then watch the client side gain a field name.</Hint>
      </div>
    ),
  },
  {
    id: 'prediction-response',
    title: 'Structuring the Prediction Response',
    subtitle: 'PredictionResponse is the contract',
    Visual: ResponseContractVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Let’s start with a basic scenario: a classification model that predicts a single category label. While you <em>could</em>{' '}
          return just the label as a string, it’s better practice to wrap it in a JSON object. This provides context and makes the
          API response more self-descriptive.
        </p>
        <p>We can define a Pydantic model to represent this structure:</p>
        <Pre>{`from pydantic import BaseModel, Field

class PredictionResponse(BaseModel):
    predicted_class: str = Field(..., description="The predicted class label.")
    # You might add other fields later, like a request ID or model version`}</Pre>
        <p>
          In your endpoint, you would then use this model in the <C>response_model</C> parameter of the path operation decorator.
          FastAPI automatically handles serializing your return value (e.g., a dictionary or another Pydantic model instance) into
          JSON conforming to <C>PredictionResponse</C>.
        </p>
        <Pre>{`# Assume 'model' is your loaded ML model object
# Assume 'InputFeatures' is your Pydantic input model

@app.post("/predict", response_model=PredictionResponse)
async def make_prediction(features: InputFeatures):
    # 1. Preprocess features if necessary
    processed_data = preprocess(features.dict()) # Example preprocessing

    # 2. Get prediction from the model
    #    Assume model.predict() returns the class label directly
    prediction_label = model.predict(processed_data)

    # 3. Return the result conforming to the response model
    return PredictionResponse(predicted_class=prediction_label)`}</Pre>
        <p>
          This approach ensures the response format is consistent and automatically includes it in the API documentation generated
          by FastAPI.
        </p>
        <Box title="Current versions" tone="amber">
          <p>
            <C>features.dict()</C> is Pydantic v1. In v2 the method is <C>model_dump()</C>. The comment is also doing real work:
            scikit-learn’s <C>predict</C> returns an array, so a <C>str</C> field usually needs <C>prediction_label[0]</C>. Returning
            the bare label string fails response validation.
          </p>
        </Box>
        <Hint>Step through the request, then return the raw label and watch the mold reject it.</Hint>
      </div>
    ),
  },
  {
    id: 'probabilities',
    title: 'Including Probabilities or Confidence Scores',
    subtitle: 'predict_proba fills a dictionary',
    Visual: ProbabilityChartVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          For many classification tasks, knowing the model’s confidence in its prediction is just as important as the prediction
          itself. Most classification models can output probabilities for each possible class. For instance, scikit-learn
          classifiers often have a <C>predict_proba()</C> method that returns an array of probabilities, one for each class.
        </p>
        <p>
          Returning these probabilities provides valuable context to the client. They might use this information to set decision
          thresholds or identify uncertain predictions that require human review.
        </p>
        <p>To include probabilities, we extend our Pydantic response model:</p>
        <Pre>{`from pydantic import BaseModel, Field
from typing import List, Dict

class ProbabilityResponse(BaseModel):
    predicted_class: str = Field(..., description="The predicted class label.")
    probabilities: Dict[str, float] = Field(..., description="A dictionary mapping class labels to their predicted probabilities.")
    # Example: {"cat": 0.95, "dog": 0.04, "other": 0.01}

@app.post("/predict_proba", response_model=ProbabilityResponse)
async def make_prediction_with_proba(features: InputFeatures):
    processed_data = preprocess(features.dict())

    # Assume model.predict() gives the label
    prediction_label = model.predict(processed_data)

    # Assume model.predict_proba() gives probabilities per class
    # and model.classes_ gives the order of classes
    proba_values = model.predict_proba(processed_data)[0] # Get probabilities for the first (only) input sample
    class_labels = model.classes_
    probabilities_dict = {label: proba for label, proba in zip(class_labels, proba_values)}

    # Sort probabilities for better readability (optional)
    sorted_probabilities = dict(sorted(probabilities_dict.items(), key=lambda item: item[1], reverse=True))

    return ProbabilityResponse(
        predicted_class=prediction_label,
        probabilities=sorted_probabilities
    )`}</Pre>
        <p>
          In this example, <C>ProbabilityResponse</C> defines a structure that includes both the most likely class (
          <C>predicted_class</C>) and a dictionary (<C>probabilities</C>) containing the probability associated with each possible
          class. The endpoint retrieves both the prediction and the probabilities from the model and packages them according to this
          structure.
        </p>
        <p>A visual representation of these probabilities can sometimes be helpful for understanding the model’s confidence distribution.</p>
        <p className="italic text-gray-400">
          Example distribution of predicted probabilities across different classes for a single input instance. Class A has the
          highest probability.
        </p>
        <Box title="Current versions" tone="amber">
          <p>
            <C>List</C> is imported and unused. <C>Dict[str, float]</C> still works; Python 3.9+ can write <C>dict[str, float]</C>.{' '}
            <C>predict</C> usually returns an array, while <C>predicted_class</C> is a <C>str</C>. NumPy floats in the dictionary
            should be turned into Python floats (for example with <C>.item()</C>) before they go into JSON. <C>.dict()</C> is{' '}
            <C>model_dump()</C> on Pydantic v2.
          </p>
        </Box>
        <Hint>Drag Class A’s share, hide the probabilities, and toggle sort order.</Hint>
      </div>
    ),
  },
  {
    id: 'output-shapes',
    title: 'Adapting to Different Model Outputs',
    subtitle: 'The schema follows the model',
    Visual: OutputShapeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>The structure of your response model should naturally reflect the output of your specific machine learning model:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Regression Models:</strong> Instead of <C>predicted_class</C> and <C>probabilities</C>, you
            might return a single <C>predicted_value</C> (float) and potentially a <C>confidence_interval</C> (e.g., a dictionary with{' '}
            <C>lower_bound</C> and <C>upper_bound</C>).
          </li>
          <li>
            <strong className="text-white">Multi-Output Models:</strong> The response model might contain multiple prediction fields
            or lists of predictions/probabilities.
          </li>
          <li>
            <strong className="text-white">Object Detection/Segmentation:</strong> Responses could involve lists of bounding boxes
            (with coordinates and class labels) or image masks.
          </li>
        </ul>
        <p>
          The principle remains the same: define a Pydantic model that accurately describes the expected output format and use it in
          the <C>response_model</C> parameter of your endpoint decorator. This provides clear contracts for your API consumers and
          uses FastAPI’s validation and documentation features.
        </p>
        <Hint>Switch the model type and watch the JSON shape change with it.</Hint>
      </div>
    ),
  },
  {
    id: 'precision-errors',
    title: 'Precision and Prediction Errors',
    subtitle: 'Round floats, and fail with an HTTP error',
    Visual: PrecisionErrorVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Remember to pay attention to numerical precision when returning floating-point numbers like probabilities. You might want
          to round them to a reasonable number of decimal places within your endpoint logic before returning the response. Also,
          ensure your endpoint handles potential errors during prediction gracefully, perhaps returning a specific HTTP error code
          and message instead of the standard prediction response.
        </p>
        <Box title="How the error should leave" tone="amber">
          <p>
            A normal <C>return</C> is still HTTP 200, even if the body says something failed. Raise <C>HTTPException</C> so the status
            code changes. The response model does not round numbers for you.
          </p>
        </Box>
        <Hint>Watch the long float get rounded. Then make the model raise.</Hint>
      </div>
    ),
  },
  {
    id: 'why-depends',
    title: 'Dependency Injection for Model Loading',
    subtitle: 'A global model is hard to replace',
    Visual: GlobalCouplingVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Machine learning models are serialized and loaded into an application environment. A key challenge is making these loaded
          models available to API endpoint functions for prediction.
        </p>
        <p>
          You could load the model into a global variable and access it directly from your endpoint functions. While simple, this
          approach can make your application harder to test and maintain, especially as it grows. Global state can lead to tight
          coupling between different parts of your code and make it difficult to swap implementations, for instance, using a mock
          model during testing.
        </p>
        <p>
          FastAPI provides a powerful and elegant solution through its <strong className="text-white">Dependency Injection</strong>{' '}
          system. Dependency Injection is a design pattern where the components an object needs (its dependencies) are “injected”
          into it from an external source, rather than the object creating them itself. In FastAPI, this system allows you to declare
          dependencies for your path operation functions (the functions handling requests like <C>@app.post("/predict")</C>), and
          FastAPI takes care of providing these dependencies when the endpoint is called.
        </p>
        <Hint>Follow the global into the endpoint, then watch a test fail to swap it until Depends opens a slot.</Hint>
      </div>
    ),
  },
  {
    id: 'depends-flow',
    title: 'How Dependency Injection Works in FastAPI',
    subtitle: 'Call, take the return value, pass it in',
    Visual: DependsFlowVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI’s dependency injection uses the <C>Depends</C> function. You declare a dependency in your path operation function’s
          parameters using <C>Depends</C>, passing it a callable (like another function). When a request comes in for that endpoint,
          FastAPI will:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Call the dependency function (the callable passed to <C>Depends</C>).</li>
          <li>Take the return value of that function.</li>
          <li>Pass that return value as the argument to your path operation function.</li>
        </ol>
        <p>
          This mechanism allows you to separate the logic for <em>providing</em> a resource (like an ML model) from the logic of{' '}
          <em>using</em> that resource within your endpoint.
        </p>
        <Hint>Step a single request from the URL to the model argument.</Hint>
      </div>
    ),
  },
  {
    id: 'injected-endpoint',
    title: 'Using Depends for Model Access',
    subtitle: 'get_model() runs before the endpoint',
    Visual: InjectedPredictVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Let’s see how this applies to accessing our machine learning model. Assume you have already loaded your model into memory
          when the application starts, perhaps storing it in a variable accessible within your application module (let’s call it{' '}
          <C>loaded_model</C>).
        </p>
        <p>First, define a simple dependency function whose only job is to return the loaded model:</p>
        <Pre>{`# Assume 'model_loader.py' handles loading the model at startup
from .model_loader import loaded_model

# Dependency function
def get_model():
    """Returns the pre-loaded machine learning model."""
    return loaded_model`}</Pre>
        <p>
          Now, in your API endpoint function where you need to perform predictions, you can declare that it depends on the result of{' '}
          <C>get_model</C>:
        </p>
        <Pre>{`from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
# Assume 'get_model' is defined as above
from .dependencies import get_model
# Assume 'ml_model_type' is the type hint for your loaded model
from typing import Any # Replace Any with your actual model type if possible

app = FastAPI()

class PredictionInput(BaseModel):
    feature1: float
    feature2: int
    # ... other features

class PredictionOutput(BaseModel):
    prediction: float # Or appropriate type

# Inject the model using Depends
@app.post("/predict/", response_model=PredictionOutput)
async def make_prediction(
    input_data: PredictionInput,
    model: Any = Depends(get_model) # Inject the model here
):
    """
    Receives input data, uses the injected model to make a prediction,
    and returns the result.
    """
    try:
        # Convert Pydantic model to format expected by the model
        # This step depends heavily on your specific model
        model_input = [[input_data.feature1, input_data.feature2]] # Example conversion

        # Use the injected model to make a prediction
        prediction_result = model.predict(model_input)

        # Assuming the prediction result is a single value or easily extractable
        return PredictionOutput(prediction=float(prediction_result[0]))
    except Exception as e:
        # Handle potential errors during prediction
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")`}</Pre>
        <p>
          In this example, before <C>make_prediction</C> is executed for an incoming request, FastAPI calls <C>get_model()</C>. The
          returned value (our <C>loaded_model</C>) is then passed as the <C>model</C> argument to <C>make_prediction</C>. The endpoint
          function itself doesn’t need to know <em>how</em> or <em>where</em> the model came from; it just receives it as a parameter.
        </p>
        <Box title="What Depends does not change" tone="amber">
          <p>
            <C>loaded_model</C> is still a module global. Depends only changes how the endpoint receives it. <C>Any</C> accepts any
            object, so a wrong return value is not caught by the type checker. <C>HTTPException</C> is imported in this snippet.
          </p>
        </Box>
        <Hint>Move the two features, then make predict raise.</Hint>
      </div>
    ),
  },
  {
    id: 'benefits',
    title: 'Benefits of Using Dependency Injection for Models',
    subtitle: 'Decouple, test, reuse, and keep the signature honest',
    Visual: DependsBenefitsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Decoupling:</strong> Your endpoint logic (<C>make_prediction</C>) is decoupled from the
            model loading logic (<C>get_model</C>). The endpoint focuses solely on validation, prediction, and response formatting.
          </li>
          <li>
            <strong className="text-white">Testability:</strong> This is a significant advantage. When writing unit tests for your{' '}
            <C>make_prediction</C> endpoint, you can easily provide a <em>different</em> dependency function (a “mock” or “fake”) that
            returns a predictable dummy model instead of the real one. This allows you to test the endpoint’s logic in isolation
            without needing the actual (potentially slow or complex) model. FastAPI’s testing utilities (<C>TestClient</C>) integrate
            smoothly with overriding dependencies.
          </li>
          <li>
            <strong className="text-white">Reusability:</strong> The <C>get_model</C> dependency function can be reused by multiple
            endpoints if they all need access to the same model instance.
          </li>
          <li>
            <strong className="text-white">Maintainability:</strong> If you need to change how the model is loaded or managed (e.g.,
            switch to a different loading mechanism or add caching), you only need to modify the <C>get_model</C> function. None of
            the endpoint functions that depend on it need to change, as long as the dependency function continues to return a
            compatible model object.
          </li>
          <li>
            <strong className="text-white">Clarity:</strong> It makes the requirements of your endpoint explicit in its function
            signature. Anyone reading the code can immediately see that the <C>make_prediction</C> function requires a <C>model</C>{' '}
            object to perform its task.
          </li>
        </ol>
        <p>
          While loading a model into a simple global variable might seem sufficient for very small applications, using FastAPI’s
          dependency injection system provides a much cleaner, more scalable, and significantly more testable architecture for
          integrating your machine learning models into production-ready APIs. It’s a standard practice in FastAPI development for
          managing resources like database connections, external service clients, and, importantly for us, machine learning models.
        </p>
        <Hint>Step through the five benefits. The test step swaps in a fake that always returns 0.5.</Hint>
      </div>
    ),
  },
  {
    id: 'storage',
    title: 'Managing Model Artifacts',
    subtitle: 'Where the serialized file lives',
    Visual: StorageLocationVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          For machine learning models, after training and serialization, the practical question is where to store these files, often
          called ‘artifacts,’ and how a FastAPI application can reliably access them. Effectively managing these artifacts is
          important for maintaining a clean project structure, ensuring reproducibility, and enabling smooth deployments.
        </p>
        <p className="text-white font-semibold">Storage Locations for Model Artifacts</p>
        <p>
          Where you store your model files depends on your application’s complexity, deployment environment, and team workflow. Let’s
          examine common approaches:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Within the Application Directory:</strong> For simpler projects or during development, you
            might store model artifacts directly within your FastAPI project structure, often in a dedicated directory like{' '}
            <C>models/</C> or <C>artifacts/</C>.
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Pros: Simple to manage, easily versioned with your application code using Git. No external dependencies for storage.</li>
              <li>Cons: Increases the size of your application package/repository. Can become unwieldy if you have many large models or frequent updates. Tightly couples model artifacts to application code deployment.</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Dedicated File Server or Network Share:</strong> In some organizational contexts, models
            might be stored on a shared network drive or a dedicated internal file server. Your application would need appropriate
            permissions and network access to retrieve these files.
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Pros: Centralized storage separate from individual application codebases.</li>
              <li>Cons: Requires managing network access and permissions. Can introduce latency if the network path is slow. May lack versioning capabilities compared to other solutions.</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Cloud Storage Services:</strong> Services like Amazon S3, Google Cloud Storage (GCS), or
            Azure Blob Storage are popular choices for production environments. They offer scalable, durable, and highly available
            storage decoupled from your application servers.
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Pros: Excellent scalability and reliability. Built-in versioning capabilities. Fine-grained access control. Models can be updated independently of application deployments.</li>
              <li>Cons: Introduces a dependency on a cloud provider. Requires handling authentication and using specific SDKs (like <C>boto3</C> for AWS, <C>google-cloud-storage</C> for GCP) to access files. Potential costs associated with storage and data transfer.</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Model Registries:</strong> Platforms like MLflow Model Registry, DVC (Data Version Control),
            Vertex AI Model Registry, or SageMaker Model Registry are designed specifically for managing the machine learning
            lifecycle, including model artifact storage, versioning, and stage management (e.g., staging, production).
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Pros: Provides a structured workflow for model management. Tracks experiments, parameters, metrics, and model lineage. Simplifies collaboration and governance. Often integrates well with cloud storage backends.</li>
              <li>Cons: Introduces another tool/platform dependency. Requires learning the specific registry’s API and workflow. Can be overkill for very simple projects.</li>
            </ul>
          </li>
        </ol>
        <Hint>Select each home for the file and compare what you gain with what you take on.</Hint>
      </div>
    ),
  },
  {
    id: 'config-load',
    title: 'Accessing Artifacts in Your Application',
    subtitle: 'Settings for the path, a choice for when to load',
    Visual: ConfigLoadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Regardless of the storage location, your FastAPI application needs a way to find and load the correct model artifact.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Configuration:</strong> Avoid hardcoding paths or bucket names directly in your application
            logic. Use configuration files (e.g., <C>.env</C> files managed with Pydantic’s settings management) or environment
            variables to specify the location of your model artifacts. This makes your application more flexible across different
            environments (development, staging, production).
          </li>
          <li>
            <strong className="text-white">Loading Strategy:</strong> As discussed in the “Loading Models into FastAPI Applications”
            section, decide whether to load models at application startup (common for frequently used models) or on-demand. Accessing
            models from cloud storage might influence this decision due to potential latency during the initial download. Caching
            mechanisms can be useful here.
          </li>
        </ul>
        <Box title="Current versions" tone="amber">
          <p>
            In Pydantic v2, settings live in the separate <C>pydantic-settings</C> package (<C>BaseSettings</C>), not in{' '}
            <C>pydantic</C> itself.
          </p>
        </Box>
        <Hint>Change the environment. A hardcoded path breaks outside dev. Then compare startup load with on-demand load.</Hint>
      </div>
    ),
  },
  {
    id: 'versioning',
    title: 'Versioning Model Artifacts',
    subtitle: 'Trace a prediction, undo a bad deploy, or run both',
    Visual: VersioningVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Machine learning models evolve. You retrain them on new data, experiment with different architectures, or update
          preprocessing steps. Versioning your model artifacts is essential for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-white">Reproducibility:</strong> Ensuring you can trace which specific model version was used for a prediction.</li>
          <li><strong className="text-white">Rollbacks:</strong> Quickly reverting to a previous, known-good model version if issues arise with a new deployment.</li>
          <li><strong className="text-white">Experimentation:</strong> Deploying different model versions simultaneously (e.g., for A/B testing).</li>
        </ul>
        <Hint>Ship v2, watch it fail, roll back, then serve both versions at once.</Hint>
      </div>
    ),
  },
  {
    id: 'version-strategies',
    title: 'Strategies for Versioning',
    subtitle: 'A name, a folder, an object version, or a registry stage',
    Visual: VersionStrategyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Simple Naming Conventions:</strong> Including version numbers or dates in filenames (e.g.,{' '}
            <C>sentiment_model_v1.2.pkl</C>, <C>forecast_model_2024-03-15.joblib</C>). This is basic but can work for small projects
            storing models locally.
          </li>
          <li>
            <strong className="text-white">Directory Structure:</strong> Using directories to separate versions (e.g.,{' '}
            <C>models/v1/model.pkl</C>, <C>models/v2/model.pkl</C>).
          </li>
          <li>
            <strong className="text-white">Cloud Storage Versioning:</strong> Most cloud providers offer object versioning,
            automatically keeping previous versions when you upload a new file with the same name. You can then reference specific
            object versions.
          </li>
          <li>
            <strong className="text-white">Model Registries:</strong> These platforms provide built-in versioning mechanisms, often
            linking versions to specific training runs, metrics, and lifecycle stages.
          </li>
        </ul>
        <Hint>Pick a strategy, then click the file the app should load.</Hint>
      </div>
    ),
  },
  {
    id: 'project-tree',
    title: 'Organizing Your Project',
    subtitle: 'A models directory next to app',
    Visual: ProjectTreeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>A clear directory structure helps manage artifacts, especially when stored locally. For example, here’s a layout like this:</p>
        <p className="italic text-gray-400">
          A sample project structure showing a dedicated <C>models/</C> directory for storing serialized model artifacts alongside the
          application code in <C>app/</C>.
        </p>
        <p>
          In this structure, your application code within <C>app/</C> would be configured to load models from the sibling <C>models/</C>{' '}
          directory.
        </p>
        <Hint>Click a box in the tree. main.py loads the sibling sentiment_v1.pkl.</Hint>
      </div>
    ),
  },
  {
    id: 'security',
    title: 'Security Measures',
    subtitle: 'The artifact is not a public file',
    Visual: ArtifactSecurityVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Treat your model artifacts with care, especially if they are proprietary or if the preprocessing steps embedded within them
          reveal sensitive information about your training data.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Local Storage:</strong> Ensure appropriate file system permissions are set on the
            directories containing your models.
          </li>
          <li>
            <strong className="text-white">Cloud Storage:</strong> Utilize the access control mechanisms (e.g., IAM policies in
            AWS/GCP, Access Keys/SAS tokens in Azure) provided by your cloud provider to restrict access to authorized applications
            or services. Encrypt artifacts at rest.
          </li>
          <li>
            <strong className="text-white">Model Registries:</strong> Leverage the authentication and authorization features offered
            by the registry platform.
          </li>
        </ul>
        <Hint>Take the credentials away and the same file becomes unreadable.</Hint>
      </div>
    ),
  },
  {
    id: 'packaging',
    title: 'Packaging for Deployment',
    subtitle: 'Copy the file in, or download it when the container starts',
    Visual: PackagingVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Your choice of artifact management strategy directly impacts how you package your application for deployment, particularly
          when using containers (covered in Chapter 6).
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Local Artifacts:</strong> You’ll need to copy the model files into the container image
            during the build process (e.g., using the <C>COPY</C> instruction in a Dockerfile).
          </li>
          <li>
            <strong className="text-white">Cloud/Registry Artifacts:</strong> Your container might not need the model files built-in.
            Instead, the application running inside the container would download the required model artifact from the external
            storage location at startup or on demand. This often leads to smaller container images but requires network access and
            credentials management within the container environment.
          </li>
        </ul>
        <p>
          Choosing the right approach involves balancing simplicity, scalability, security, and integration with your MLOps workflow.
          For production systems, leveraging cloud storage or a dedicated model registry is generally recommended over bundling
          models directly with the application code.
        </p>
        <Hint>Compare image size, then cut the network on the download path.</Hint>
      </div>
    ),
  },
];

export default function SerializingAndDeserializingMLModelsPartThree() {
  return <ChapterDeck slides={slidesData} />;
}
