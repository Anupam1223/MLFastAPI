import React from 'react';
import ChapterDeck from '../components/ChapterDeck';
import {
  TypesVsConstraintsVisualizer,
  AutoConversionVisualizer,
  NumericConstraintsVisualizer,
  StringConstraintsVisualizer,
  CollectionConstraintsVisualizer,
  HouseConstraintsVisualizer,
  FailFastVisualizer,
} from '../components/PydanticPart3ConstraintVisualizers';
import {
  FlatVsNestedVisualizer,
  NestedModelsVisualizer,
  NestedValidationVisualizer,
  NestedResponseVisualizer,
  NestedDiagramVisualizer,
} from '../components/PydanticPart3NestedVisualizers';
import {
  HouseRequirementsVisualizer,
  SchemaAnatomyVisualizer,
  PriceEndpointVisualizer,
  ValidationTestVisualizer,
  RequestFlowVisualizer,
} from '../components/PydanticPart3PracticalVisualizers';

export const meta = {
  title: 'Data Handling and Validation with Pydantic (Part 3)',
  subtitle: 'Conversion, Field constraints, nested models, and a hands-on validator',
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
    id: 'intro',
    title: 'Data Conversion and Constraints',
    subtitle: 'Beyond “is it the right type?”',
    Visual: TypesVsConstraintsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While Pydantic’s type hints provide a strong foundation for data validation, automatically checking if input data
          matches expected types like <C>int</C>, <C>float</C>, or <C>str</C>, applications often require{' '}
          <strong className="text-white">more granular control</strong>.
        </p>
        <Box title="You might need to ensure…" tone="teal">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>a numerical input falls within a <strong className="text-white">specific range</strong>,</li>
            <li>a string meets a certain <strong className="text-white">length requirement</strong>,</li>
            <li>or a list contains a <strong className="text-white">precise number of elements</strong>.</li>
          </ul>
        </Box>
        <p>This is where Pydantic’s data conversion capabilities and constraint definitions become invaluable.</p>
        <Hint>On the right, find values that pass the type check but still make no sense.</Hint>
      </div>
    ),
  },
  {
    id: 'conversion',
    title: 'Automatic Data Conversion',
    subtitle: '"42" becomes 42',
    Visual: AutoConversionVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          One of Pydantic’s helpful features is its attempt to automatically convert input data to the types you’ve specified in
          your models. For instance, if your API expects an integer but receives the string <C>"123"</C>, Pydantic will often
          successfully convert the string to the integer <C>123</C>.
        </p>
        <p>Here’s a simple model:</p>
        <Pre>{`from pydantic import BaseModel

class Item(BaseModel):
    item_id: int
    name: str
    price: float
    is_offer: bool | None = None # Allows boolean or None`}</Pre>
        <p>If your FastAPI endpoint receives a JSON payload like:</p>
        <Pre>{`{
    "item_id": "42",
    "name": "Example Item",
    "price": "99.95",
    "is_offer": "true"
}`}</Pre>
        <p>Pydantic will parse this and convert the values:</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li><C>"42"</C> becomes the integer <C>42</C>.</li>
          <li><C>"99.95"</C> becomes the float <C>99.95</C>.</li>
          <li><C>"true"</C> becomes the boolean <C>True</C>.</li>
        </ul>
        <Box title="Rely on it judiciously" tone="amber">
          <p>
            This automatic conversion simplifies handling common data formats found in web requests. However, if conversion fails
            (e.g., trying to convert <C>"abc"</C> to an integer), Pydantic raises a validation error, which FastAPI automatically
            translates into an informative HTTP error response for the client.
          </p>
        </Box>
        <Hint>Change what the client sends for each field on the right and step through the conversion.</Hint>
      </div>
    ),
  },
  {
    id: 'numeric',
    title: 'Defining Explicit Constraints with Field',
    subtitle: 'Numeric constraints: gt, ge, lt, le',
    Visual: NumericConstraintsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          For more precise validation rules, Pydantic provides the <C>Field</C> function. You use <C>Field</C> as the default
          value when defining an attribute in your <C>BaseModel</C>, allowing you to specify various constraints. Let’s explore
          common constraints useful for machine learning inputs.
        </p>
        <Box title="Numeric Constraints" tone="sky">
          <p>When dealing with numerical features, you often need to restrict their range. Field offers several parameters:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><C>gt</C>: Greater than</li>
            <li><C>ge</C>: Greater than or equal to</li>
            <li><C>lt</C>: Less than</li>
            <li><C>le</C>: Less than or equal to</li>
          </ul>
        </Box>
        <Pre>{`from pydantic import BaseModel, Field

class ModelInput(BaseModel):
    # Feature must be positive
    feature1: float = Field(..., gt=0)
    # Probability must be between 0 and 1 (inclusive)
    probability_threshold: float = Field(..., ge=0, le=1)
    # Integer feature within a specific range
    count_feature: int = Field(..., ge=0, le=100)`}</Pre>
        <p>
          Here, <C>...</C> (Ellipsis) indicates that the field is <strong className="text-white">required</strong>. If you provide
          a default value instead of <C>...</C>, the field becomes optional. Using these constraints ensures that nonsensical values
          (like negative probabilities or counts) are rejected before they reach your model prediction logic.
        </p>
        <Hint>Use the three tabs on the right: the operators, ModelInput, and ... vs a default.</Hint>
      </div>
    ),
  },
  {
    id: 'string',
    title: 'String Constraints',
    subtitle: 'min_length, max_length, pattern',
    Visual: StringConstraintsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Text inputs also frequently benefit from constraints:</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li><C>min_length</C>: Minimum string length</li>
          <li><C>max_length</C>: Maximum string length</li>
          <li><C>pattern</C>: A regular expression the string must match</li>
        </ul>
        <Pre>{`from pydantic import BaseModel, Field
import re # Import the regex module

class UserProfile(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    # Ensure user ID follows a specific format (e.g., starts with 'UID' followed by digits)
    user_id: str = Field(..., pattern=r"^UID\\d+$")
    # Optional bio with max length
    bio: str | None = Field(default=None, max_length=250)`}</Pre>
        <p>
          Regular expression patterns (<C>pattern</C>) are particularly useful for validating structured identifiers or specific
          text formats often encountered in data preprocessing steps.
        </p>
        <p className="text-xs text-gray-400">
          The <C>import re</C> line isn’t actually needed: Pydantic compiles the pattern string itself.
        </p>
        <Hint>Type into each field on the right: watch the length meter and the pattern matcher character by character.</Hint>
      </div>
    ),
  },
  {
    id: 'collection',
    title: 'Collection Constraints',
    subtitle: 'Size limits for lists and feature vectors',
    Visual: CollectionConstraintsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>For features represented as lists or other collections (like feature vectors), you might need to enforce size limits:</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li><C>min_items</C>: Minimum number of items in the collection</li>
          <li><C>max_items</C>: Maximum number of items in the collection</li>
        </ul>
        <Pre>{`from pydantic import BaseModel, Field

class EmbeddingInput(BaseModel):
    # Expecting a fixed-size vector of 128 floats
    vector: list[float] = Field(..., min_items=128, max_items=128)
    # Tags list, must have at least one tag, max 10
    tags: list[str] = Field(..., min_items=1, max_items=10)`}</Pre>
        <Box title="Why it matters for ML" tone="emerald">
          <p>
            This is essential for many ML models that expect input vectors of a <strong className="text-white">specific
            dimensionality</strong>. Validating the size early prevents runtime errors during model inference.
          </p>
        </Box>
        <p className="text-xs text-gray-400">
          In Pydantic v2 these are named <C>min_length</C>/<C>max_length</C> (the same names as for strings);{' '}
          <C>min_items</C>/<C>max_items</C> are the v1 names and are deprecated.
        </p>
        <Hint>Resize the vector on the right, then turn off the size check to see where the error happens instead.</Hint>
      </div>
    ),
  },
  {
    id: 'practice',
    title: 'Applying Constraints in Practice',
    subtitle: 'A house price prediction model',
    Visual: HouseConstraintsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Let’s combine these concepts into a Pydantic model designed to validate input for a house price prediction model.</p>
        <Pre>{`from pydantic import BaseModel, Field

class HouseFeatures(BaseModel):
    area_sqft: float = Field(
        ...,
        gt=0,
        description="Surface area of the house in square feet.",
        example=1500.50
    )
    bedrooms: int = Field(
        ...,
        ge=1,
        le=10,
        description="Number of bedrooms.",
        example=3
    )
    year_built: int = Field(
        ...,
        gt=1800,
        lt=2025, # Assuming current year context
        description="Year the house was built.",
        example=1995
    )
    zip_code: str = Field(
        ...,
        pattern=r"^\\d{5}$", # US 5-digit zip code format
        description="5-digit US zip code.",
        example="90210"
    )

# Example usage in a FastAPI endpoint
# from fastapi import FastAPI
# app = FastAPI()
# @app.post("/predict_price/")
# async def predict_house_price(features: HouseFeatures):
#     # At this point, 'features' is guaranteed to be valid
#     # according to the constraints defined in HouseFeatures.
#     # Proceed with model prediction...
#     prediction = ... # your_model.predict([[features.area_sqft, ...]])
#     return {"predicted_price": prediction}`}</Pre>
        <p>
          If a client sends a request to <C>/predict_price/</C> with data that violates any of these constraints (e.g.,{' '}
          <C>bedrooms: 0</C>, <C>area_sqft: -100</C>, or <C>zip_code: "abcde"</C>), FastAPI, powered by Pydantic, will
          automatically return a <strong className="text-white">422 Unprocessable Entity</strong> error response. This response
          details exactly which fields failed validation and why, providing clear feedback to the API consumer.
        </p>
        <p className="text-xs text-gray-400">
          In Pydantic v2, <C>example=</C> still works but is deprecated; the current form is <C>examples=[1500.50]</C>.
        </p>
        <Hint>Load “all three” on the right: every violation comes back in a single response.</Hint>
      </div>
    ),
  },
  {
    id: 'fail-fast',
    title: 'Declarative, Reusable, Fail Fast',
    subtitle: 'Why Field constraints belong in the model',
    Visual: FailFastVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          By leveraging Pydantic’s <C>Field</C> function for data conversion and constraints, you move validation logic{' '}
          <strong className="text-white">out of your endpoint functions</strong> and into{' '}
          <strong className="text-white">declarative, reusable models</strong>.
        </p>
        <Box title="This leads to" tone="teal">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>cleaner API code,</li>
            <li>improved robustness against invalid data,</li>
            <li>and better adherence to the principle of <strong className="text-white">“fail fast”</strong> by catching errors at the earliest possible stage.</li>
          </ul>
        </Box>
        <p>
          This ensures that the data reaching your ML model inference code is already vetted for correctness according to the rules
          you’ve defined.
        </p>
        <Hint>Race the two lanes on the right with each payload.</Hint>
      </div>
    ),
  },
  {
    id: 'complex',
    title: 'Structuring Complex Data Models',
    subtitle: 'Nesting models inside models',
    Visual: FlatVsNestedVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Pydantic models are effective for managing different data structures, including straightforward, flat arrangements.
          However, machine learning inputs and outputs frequently require <strong className="text-white">more intricate, nested
          structures</strong>.
        </p>
        <Box title="For example, you might need to…" tone="sky">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>send configuration parameters alongside input features,</li>
            <li>or return predictions along with confidence scores and metadata.</li>
          </ul>
        </Box>
        <p>Pydantic provides the capability to define these complex structures by nesting models within other models.</p>
        <p>
          This approach aligns perfectly with how <strong className="text-white">JSON naturally represents hierarchical
          data</strong>, making it straightforward to define precisely what your API expects and returns.
        </p>
        <Hint>Toggle flat vs nested on the right and watch the keys regroup.</Hint>
      </div>
    ),
  },
  {
    id: 'nested-define',
    title: 'Defining Nested Models',
    subtitle: 'ModelConfig + InputFeatures → PredictionRequest',
    Visual: NestedModelsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Creating a nested model in Pydantic is intuitive. You simply use <strong className="text-white">another Pydantic model as
          the type annotation</strong> for a field within your main model.
        </p>
        <p>
          Let’s look at an example where our ML model requires not just the primary input data but also some configuration
          settings. We can define separate models for the configuration and the overall request structure.
        </p>
        <Pre>{`from pydantic import BaseModel, Field
from typing import List, Optional

# Define a model for configuration settings
class ModelConfig(BaseModel):
    model_version: str = "latest"
    confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    return_probabilities: bool = False

# Define the main input data model
class InputFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

# Define the overall request model, nesting ModelConfig and InputFeatures
class PredictionRequest(BaseModel):
    request_id: str
    features: InputFeatures           # Nesting the InputFeatures model
    config: Optional[ModelConfig] = None # Nesting ModelConfig, making it optional`}</Pre>
        <p>In this PredictionRequest model:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            The <C>features</C> field is explicitly typed as <C>InputFeatures</C>. Pydantic expects the data for this field to
            conform to the <C>InputFeatures</C> schema.
          </li>
          <li>
            The <C>config</C> field is typed as <C>Optional[ModelConfig]</C>. This means it expects data conforming to the{' '}
            <C>ModelConfig</C> schema, but it’s also acceptable if this field is not provided in the request (it will default to{' '}
            <C>None</C>). If it <em>is</em> provided, it must be a valid <C>ModelConfig</C> structure.
          </li>
        </ul>
        <Hint>Step through the classes on the right, then try different values for config.</Hint>
      </div>
    ),
  },
  {
    id: 'nested-fastapi',
    title: 'Using Nested Models in FastAPI',
    subtitle: 'Parse → validate → instantiate',
    Visual: NestedValidationVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI integrates these nested Pydantic models. When you use <C>PredictionRequest</C> as a type hint for a request body
          parameter in your path operation function, FastAPI, powered by Pydantic, will automatically:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong className="text-white">Parse:</strong> Read the incoming JSON request body.</li>
          <li>
            <strong className="text-white">Validate:</strong> Check if the JSON structure matches <C>PredictionRequest</C>,
            including the nested <C>InputFeatures</C> and <C>ModelConfig</C> structures if provided. It verifies data types (e.g.,{' '}
            <C>float</C> for widths, <C>str</C> for <C>request_id</C>) and constraints (e.g., <C>confidence_threshold</C> between
            0.0 and 1.0).
          </li>
          <li><strong className="text-white">Instantiate:</strong> Create an instance of the <C>PredictionRequest</C> class, populated with the validated data.</li>
        </ol>
        <p>Here’s how you might use PredictionRequest in an endpoint:</p>
        <Pre>{`from fastapi import FastAPI

# Assume PredictionRequest, InputFeatures, ModelConfig are defined as above

app = FastAPI()

@app.post("/predict")
async def create_prediction(request: PredictionRequest):
    # Access nested data easily
    features_data = request.features
    config_data = request.config if request.config else ModelConfig() # Use defaults if not provided

    print(f"Received request: {request.request_id}")
    print(f"Features: {features_data.dict()}")
    print(f"Config: Version={config_data.model_version}, Threshold={config_data.confidence_threshold}")

    # (Model inference logic would go here)
    # ...

    prediction = {"class": "setosa", "probability": 0.95} # Example output

    return {"request_id": request.request_id, "prediction": prediction}`}</Pre>
        <p>
          If a client sends a request with an invalid structure, like providing a string for <C>sepal_length</C> or omitting a
          required field like <C>request_id</C>, FastAPI will automatically return a{' '}
          <strong className="text-white">422 Unprocessable Entity</strong> error response detailing the validation issues, without
          your endpoint code even running.
        </p>
        <Hint>Try each body on the right. Look at how the error loc walks into the nested model.</Hint>
      </div>
    ),
  },
  {
    id: 'nested-response',
    title: 'Nested Models for Response Data',
    subtitle: 'PredictionResponse with a list of PredictionResult',
    Visual: NestedResponseVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Just as you structure complex inputs, you often need to structure complex outputs. For example, returning not just a
          prediction label but also associated probabilities or bounding boxes. You can use nested Pydantic models with the{' '}
          <C>response_model</C> parameter in your path operation decorator.
        </p>
        <Pre>{`from pydantic import BaseModel
from typing import List, Dict

class PredictionResult(BaseModel):
    predicted_class: str
    probability: Optional[float] = None

class PredictionResponse(BaseModel):
    request_id: str
    results: List[PredictionResult] # List containing nested PredictionResult models
    model_version_used: str

# Assume app and PredictionRequest are defined as above

@app.post("/predict_detailed", response_model=PredictionResponse)
async def create_detailed_prediction(request: PredictionRequest):
    # (Model inference logic)
    # Assume model predicts multiple results or probabilities
    model_output = [
        {"predicted_class": "setosa", "probability": 0.98},
        {"predicted_class": "versicolor", "probability": 0.02},
    ]
    config_data = request.config if request.config else ModelConfig()

    # Construct the response conforming to PredictionResponse
    response_data = PredictionResponse(
        request_id=request.request_id,
        results=[PredictionResult(**item) for item in model_output],
        model_version_used=config_data.model_version
    )

    return response_data`}</Pre>
        <p>By setting <C>response_model=PredictionResponse</C>, FastAPI ensures:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong className="text-white">Validation:</strong> The data returned by your function is validated against the <C>PredictionResponse</C> schema (including the nested <C>PredictionResult</C> list).</li>
          <li><strong className="text-white">Serialization:</strong> The returned Pydantic model instance is automatically serialized to JSON.</li>
          <li><strong className="text-white">Filtering:</strong> Only the fields defined in <C>PredictionResponse</C> are included in the final HTTP response, preventing accidental leakage of internal data.</li>
          <li><strong className="text-white">Documentation:</strong> The API documentation (e.g., Swagger UI) accurately reflects the nested response structure.</li>
        </ol>
        <p className="text-xs text-gray-400">
          The snippet uses <C>Optional</C> but only imports <C>List, Dict</C>; add <C>Optional</C> to the import when running it
          on its own.
        </p>
        <Hint>Step from raw model output to the final JSON, then try the extra key and the bad probability.</Hint>
      </div>
    ),
  },
  {
    id: 'nested-diagram',
    title: 'Diagram: Nested Input Model Structure',
    subtitle: 'Composition of PredictionRequest',
    Visual: NestedDiagramVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>The following diagram illustrates the composition of the <C>PredictionRequest</C> model defined earlier.</p>
        <Box title="What the diagram shows" tone="sky">
          <p>
            The <C>PredictionRequest</C> model contains an instance of <C>InputFeatures</C> and{' '}
            <strong className="text-white">optionally</strong> an instance of <C>ModelConfig</C>.
          </p>
        </Box>
        <p>
          Structuring your data models using nesting is a powerful way to handle the complexity inherent in many machine learning
          tasks, ensuring <strong className="text-white">data integrity and clarity</strong> in your API definitions. This
          declarative approach using Pydantic significantly simplifies validation logic within your FastAPI application.
        </p>
        <Hint>Click the boxes on the right, and switch config off to see the optional edge become None.</Hint>
      </div>
    ),
  },
  {
    id: 'hands-on',
    title: 'Hands-on Practical: Validating ML Input Data',
    subtitle: 'Defining the input schema',
    Visual: HouseRequirementsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          A Pydantic model will be created to validate input data for a machine learning model, specifically one designed to
          predict house prices based on certain features. Validating that input data conforms to the expected structure and
          constraints is fundamental before feeding it into any model for inference.
        </p>
        <Box title="Imagine our model requires these input features" tone="teal">
          <ul className="list-disc pl-5 space-y-0.5">
            <li><C>area_sqft</C>: The living area in square feet (must be a positive number).</li>
            <li><C>bedrooms</C>: The number of bedrooms (must be a non-negative integer).</li>
            <li><C>bathrooms</C>: The number of bathrooms (can be half-bathrooms, so a positive float, e.g., 1.5).</li>
            <li><C>region</C>: The region where the house is located (must be one of 'North', 'South', 'East', 'West').</li>
          </ul>
        </Box>
        <p>We can define a Pydantic model to represent and validate this structure. First, let’s define an <C>Enum</C> for the allowed regions and then create our Pydantic <C>BaseModel</C>.</p>
        <Pre>{`# models.py
from pydantic import BaseModel, Field, validator
from enum import Enum

class HouseRegion(str, Enum):
    """Permitted regions for house location."""
    NORTH = "North"
    SOUTH = "South"
    EAST = "East"
    WEST = "West"

class HouseFeatures(BaseModel):
    """Input features for the house price prediction model."""
    area_sqft: float = Field(..., gt=0, description="Living area in square feet, must be positive.")
    bedrooms: int = Field(..., ge=0, description="Number of bedrooms, must be non-negative.")
    bathrooms: float = Field(..., gt=0, description="Number of bathrooms, must be positive (e.g., 1.5 for 1 full, 1 half).")
    region: HouseRegion = Field(..., description="Region where the house is located.")

    # Example of a custom validator if needed, though Field constraints cover this case
    # @validator('area_sqft')
    # def area_must_be_positive(cls, v):
    #     if v <= 0:
    #         raise ValueError('Area must be positive')
    #     return v

    class Config:
        # Provides example data for documentation
        schema_extra = {
            "example": {
                "area_sqft": 1500.5,
                "bedrooms": 3,
                "bathrooms": 2.5,
                "region": "North"
            }
        }`}</Pre>
        <Hint>Pick a requirement on the right to find it in the code, then test values against it.</Hint>
      </div>
    ),
  },
  {
    id: 'anatomy',
    title: 'Inside the HouseFeatures Model',
    subtitle: 'Type hints, Field, Enum, Config',
    Visual: SchemaAnatomyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>In this HouseFeatures model:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>We use type hints (<C>float</C>, <C>int</C>, <C>HouseRegion</C>) for basic type validation.</li>
          <li>
            <C>Field</C> is imported from Pydantic and used to add constraints:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li><C>...</C> indicates the field is required.</li>
              <li><C>gt=0</C> means “greater than 0”.</li>
              <li><C>ge=0</C> means “greater than or equal to 0”.</li>
              <li><C>description</C> helps document the field in the API schema.</li>
            </ul>
          </li>
          <li>We use the <C>HouseRegion</C> enum to restrict the <C>region</C> field to specific string values.</li>
          <li>The <C>Config.schema_extra</C> provides an example payload that will appear in the automatically generated API documentation.</li>
          <li>A commented-out custom <C>@validator</C> is shown as an example, although Pydantic’s built-in <C>Field</C> constraints often suffice for simple checks like positivity.</li>
        </ul>
        <p className="text-xs text-gray-400">
          <C>Config.schema_extra</C> and <C>@validator</C> are Pydantic v1 spellings. They still run on v2 with deprecation
          warnings; the v2 equivalents are listed under the visual.
        </p>
        <Hint>Click each ingredient on the right to see what it does.</Hint>
      </div>
    ),
  },
  {
    id: 'endpoint',
    title: 'Integrating with a FastAPI Endpoint',
    subtitle: 'POST /predict/house_price',
    Visual: PriceEndpointVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Now, let’s create a simple FastAPI application that uses this model to validate incoming request data for a prediction endpoint.</p>
        <Pre>{`# main.py
from fastapi import FastAPI, HTTPException
from models import HouseFeatures # Assuming models.py is in the same directory

app = FastAPI(
    title="House Price Prediction API",
    description="API to predict house prices based on features.",
    version="0.1.0",
)

@app.post("/predict/house_price")
async def predict_house_price(features: HouseFeatures):
    """
    Predicts the price of a house based on its features.

    This endpoint accepts house features and returns a placeholder prediction.
    Input validation is performed using the \`HouseFeatures\` model.
    """
    # In a real application, you would load your ML model here
    # and use the validated features: features.area_sqft, features.bedrooms, etc.
    # Example: prediction = model.predict([[features.area_sqft, features.bedrooms, ...]])

    # For this practice, we just return the validated data and a dummy prediction
    print(f"Received valid features: {features.dict()}")

    # Dummy prediction logic
    estimated_price = (features.area_sqft * 100) + (features.bedrooms * 5000) + (features.bathrooms * 3000)
    if features.region == "North":
        estimated_price *= 1.2
    elif features.region == "West":
        estimated_price *= 1.1

    return {"validated_features": features, "estimated_price": round(estimated_price, 2)}

# To run this app: uvicorn main:app --reload`}</Pre>
        <p>
          Here, the <C>/predict/house_price</C> endpoint expects a POST request. By type-hinting the <C>features</C> parameter
          with our <C>HouseFeatures</C> model (<C>features: HouseFeatures</C>), FastAPI automatically:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Reads the JSON body of the incoming request.</li>
          <li>Attempts to parse and validate the data against the <C>HouseFeatures</C> model.</li>
          <li>If validation succeeds, the <C>features</C> variable within the function will be an instance of <C>HouseFeatures</C>, containing the validated data.</li>
          <li>If validation fails (e.g., missing fields, incorrect types, values outside constraints), FastAPI automatically returns a <strong className="text-white">422 Unprocessable Entity</strong> HTTP error response detailing the validation errors.</li>
        </ol>
        <Hint>Move the sliders on the right and step through the request.</Hint>
      </div>
    ),
  },
  {
    id: 'testing',
    title: 'Testing the Validation',
    subtitle: 'curl or /docs',
    Visual: ValidationTestVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Run the application using Uvicorn: <C>uvicorn main:app --reload</C>. Now, you can test the endpoint using tools like{' '}
          <C>curl</C> or FastAPI’s interactive documentation available at <C>http://127.0.0.1:8000/docs</C>.
        </p>
        <Box title="Valid Request" tone="emerald">
          <Pre>{`curl -X POST "http://127.0.0.1:8000/predict/house_price" \\
-H "Content-Type: application/json" \\
-d '{
    "area_sqft": 2150.75,
    "bedrooms": 4,
    "bathrooms": 3,
    "region": "West"
}'`}</Pre>
          <p className="text-xs">Expected Response (Status Code 200):</p>
          <Pre>{`{
  "validated_features": {
    "area_sqft": 2150.75,
    "bedrooms": 4,
    "bathrooms": 3,
    "region": "West"
  },
  "estimated_price": 268582.5
}`}</Pre>
        </Box>
        <Box title="Invalid Request (Negative Area)" tone="rose">
          <Pre>{`curl -X POST "http://127.0.0.1:8000/predict/house_price" \\
-H "Content-Type: application/json" \\
-d '{
    "area_sqft": -100,
    "bedrooms": 2,
    "bathrooms": 1,
    "region": "South"
}'`}</Pre>
          <p className="text-xs">Expected Response (Status Code 422):</p>
          <Pre>{`{
  "detail": [
    {
      "loc": ["body", "area_sqft"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt",
      "ctx": { "limit_value": 0 }
    }
  ]
}`}</Pre>
        </Box>
        <Box title="Invalid Request (Incorrect Region)" tone="rose">
          <Pre>{`curl -X POST "http://127.0.0.1:8000/predict/house_price" \\
-H "Content-Type: application/json" \\
-d '{
    "area_sqft": 1200,
    "bedrooms": 2,
    "bathrooms": 1.5,
    "region": "Central"
}'`}</Pre>
          <p className="text-xs">Expected Response (Status Code 422):</p>
          <Pre>{`{
  "detail": [
    {
      "loc": ["body", "region"],
      "msg": "value is not a valid enumeration member; permitted: 'North', 'South', 'East', 'West'",
      "type": "type_error.enum",
      "ctx": {
        "enum_values": ["North", "South", "East", "West"]
      }
    }
  ]
}`}</Pre>
        </Box>
        <p className="text-xs text-gray-400">
          These error bodies are in the Pydantic v1 format. Current FastAPI with Pydantic v2 returns <C>type</C>, <C>loc</C>,{' '}
          <C>msg</C>, <C>input</C> and <C>ctx</C> with different wording. The visual can show both. The formula actually gives
          268482.5 for the valid request, not 268582.5.
        </p>
        <Hint>Send each request on the right and switch the error format.</Hint>
      </div>
    ),
  },
  {
    id: 'flow',
    title: 'Request Validation Flow',
    subtitle: 'Valid data proceeds, invalid data is rejected automatically',
    Visual: RequestFlowVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          This hands-on exercise demonstrates how Pydantic models, when integrated with FastAPI endpoints, provide a{' '}
          <strong className="text-white">powerful and declarative way to enforce data contracts</strong>.
        </p>
        <Box title="What you get" tone="teal">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Automatic validation shields your downstream logic, including ML model inference, from malformed or nonsensical input data.</li>
            <li>More reliable and maintainable applications.</li>
            <li>Clear error messages that significantly aid API consumers in debugging their requests.</li>
          </ul>
        </Box>
        <p className="italic text-gray-400">
          Request validation flow using Pydantic within a FastAPI endpoint. Valid data proceeds to the endpoint logic, while invalid
          data triggers an automatic error response.
        </p>
        <Hint>Follow a valid and an invalid payload through the diagram on the right.</Hint>
      </div>
    ),
  },
];

export default function DataHandlingAndValidationWithPydanticPartThree() {
  return <ChapterDeck slides={slidesData} />;
}
