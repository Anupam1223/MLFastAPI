import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  ResponseContractVisualizer,
  WhyResponseModelsVisualizer,
  PredictionResultVisualizer,
  ResponseFilterVisualizer,
  CleanContractVisualizer,
  ExcludeFlagsVisualizer,
  ItemExampleVisualizer,
  UnionResponseVisualizer,
} from '../components/PydanticPart2ResponseVisualizers';
import {
  UrlAnatomyVisualizer,
  PathLookupVisualizer,
  PathConstraintVisualizer,
  QueryBasicsVisualizer,
  QueryRulesVisualizer,
  QueryValidatorVisualizer,
  ParamDocsVisualizer,
} from '../components/PydanticPart2ParamsVisualizers';

export const meta = {
  title: 'Data Handling and Validation with Pydantic (Part 2)',
  subtitle: 'Response models, serialization control, and path & query parameters',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;

const Pre = CodeBlock;

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
    id: 'definition',
    title: 'Response Model Definition',
    subtitle: 'A contract for what your API sends back',
    Visual: ResponseContractVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Pydantic models play a central role in managing data within APIs. They are used for{' '}
          <strong className="text-white">validating incoming request data</strong> and are particularly valuable for{' '}
          <strong className="text-white">defining and controlling the data your API sends back</strong> in responses.
        </p>
        <Box title="By using a response_model, an API…" tone="teal">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>adheres to a <strong className="text-white">predefined contract</strong>,</li>
            <li><strong className="text-white">automatically filters</strong> outgoing data,</li>
            <li>and significantly <strong className="text-white">improves its documentation and usability</strong>.</li>
          </ul>
        </Box>
        <Hint>Step through the contract on the right, then switch the response model off and compare.</Hint>
      </div>
    ),
  },
  {
    id: 'why',
    title: 'Why Define Response Models?',
    subtitle: 'Five advantages over returning raw dicts',
    Visual: WhyResponseModelsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While you <em>can</em> return arbitrary data structures like dictionaries or lists directly from your path operation
          functions, explicitly defining a response model offers several advantages:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            <strong className="text-white">Data Validation:</strong> FastAPI validates that the data you return from your
            function conforms to the structure and types defined in your <C>response_model</C>. This acts as a safety check,
            preventing accidental exposure of incorrect or malformed data.
          </li>
          <li>
            <strong className="text-white">Data Filtering:</strong> If your function returns an object with more fields than
            defined in the <C>response_model</C>, FastAPI automatically filters out the extra fields. This is extremely useful
            for controlling exactly what data is exposed to the client, hiding internal implementation details or sensitive
            information.
          </li>
          <li>
            <strong className="text-white">Serialization Control:</strong> Pydantic handles the conversion of your return
            object (which might be a Pydantic model instance, a dictionary, a database object, etc.) into the JSON format
            expected by the client, based on the <C>response_model</C> definition.
          </li>
          <li>
            <strong className="text-white">Automatic Documentation:</strong> FastAPI uses the <C>response_model</C> to
            generate the schema for the expected response in your API documentation (like the interactive Swagger UI at{' '}
            <C>/docs</C>). This makes your API self-documenting and easier for consumers to understand.
          </li>
          <li>
            <strong className="text-white">Editor Support:</strong> Using explicit models provides better autocompletion and
            type checking in your development environment.
          </li>
        </ol>
        <Hint>Each tab on the right demonstrates one advantage.</Hint>
      </div>
    ),
  },
  {
    id: 'define',
    title: 'Defining a Response Model',
    subtitle: 'PredictionResult for a classifier',
    Visual: PredictionResultVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Defining a response model is <strong className="text-white">identical to defining a request model</strong>: you
          create a class inheriting from Pydantic’s <C>BaseModel</C>.
        </p>
        <p>
          Let’s examine an ML prediction scenario. Suppose our model predicts a classification{' '}
          <strong className="text-white">label</strong> (a string) and a <strong className="text-white">confidence</strong>{' '}
          score (a float). We can define a Pydantic model for this output:
        </p>
        <Pre>{`from pydantic import BaseModel, Field

class PredictionResult(BaseModel):
    label: str = Field(..., description="The predicted class label.")
    confidence: float = Field(..., ge=0.0, le=1.0,
        description="The prediction confidence score (0.0 to 1.0).")

# Example internal data structure our function might produce
# Note it has an extra 'internal_model_version' field
internal_data = {
    "label": "cat",
    "confidence": 0.95,
    "internal_model_version": "v1.2.3"
}`}</Pre>
        <Hint>Click the parts of each Field(...) on the right, and drag the confidence outside 0.0–1.0.</Hint>
      </div>
    ),
  },
  {
    id: 'use',
    title: 'Using response_model',
    subtitle: 'Take → validate → filter → serialize',
    Visual: ResponseFilterVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Now, we use the <C>response_model</C> parameter in the path operation decorator to apply this model to the response:
        </p>
        <Pre>{`@app.post("/predict/", response_model=PredictionResult)
async def make_prediction(input_data: dict): # Assuming input validation elsewhere
    # ... process input_data and run ML model ...
    # Function returns a dictionary with more fields than PredictionResult
    prediction_output = {
        "label": "cat",
        "confidence": 0.95,
        "internal_model_version": "v1.2.3",
        "processing_time_ms": 50
    }
    return prediction_output`}</Pre>
        <p>
          When a client calls <C>/predict/</C>, even though <C>make_prediction</C> returns a dictionary containing{' '}
          <C>internal_model_version</C> and <C>processing_time_ms</C>, FastAPI performs the following steps:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>It takes the returned dictionary <C>prediction_output</C>.</li>
          <li>
            It validates this dictionary against the <C>PredictionResult</C> model. It checks if <C>label</C> is a string and{' '}
            <C>confidence</C> is a float between 0.0 and 1.0. If validation fails, it raises an{' '}
            <strong className="text-white">internal server error</strong>.
          </li>
          <li>
            It filters the data, keeping only the fields defined in <C>PredictionResult</C> (<C>label</C> and{' '}
            <C>confidence</C>). The <C>internal_model_version</C> and <C>processing_time_ms</C> fields are discarded.
          </li>
          <li>It serializes the filtered data into a JSON response sent to the client.</li>
        </ol>
        <Hint>Step through the four stages, then break the output and watch step 2 turn it into a 500.</Hint>
      </div>
    ),
  },
  {
    id: 'client-receives',
    title: 'What the Client Receives',
    subtitle: 'Rich internal objects, lean public contract',
    Visual: CleanContractVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>The client will receive:</p>
        <Pre>{`{
  "label": "cat",
  "confidence": 0.95
}`}</Pre>
        <Box title="A clean API contract" tone="emerald">
          <p>
            This filtering mechanism is a powerful feature for maintaining clean API contracts. You can work with{' '}
            <strong className="text-white">richer internal objects</strong> within your application logic but expose{' '}
            <strong className="text-white">only the necessary fields</strong> externally.
          </p>
        </Box>
        <Hint>
          On the right, your service evolves over several releases and its internal dict keeps growing. With a response model,
          what clients see stays the same.
        </Hint>
      </div>
    ),
  },
  {
    id: 'fine-tuning',
    title: 'Fine-tuning Response Serialization',
    subtitle: 'exclude_unset, exclude_defaults, exclude_none',
    Visual: ExcludeFlagsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI provides parameters to further control which fields are included in the response, often useful for{' '}
          <strong className="text-white">optimizing payload size</strong> or <strong className="text-white">hiding default values</strong>:
        </p>
        <Box title="response_model_exclude_unset=True" tone="sky">
          <p>Excludes fields that were not explicitly set in the returned data and still have their default values.</p>
        </Box>
        <Box title="response_model_exclude_defaults=True" tone="amber">
          <p>Excludes fields that have a value equal to their default value, even if explicitly set.</p>
        </Box>
        <Box title="response_model_exclude_none=True" tone="violet">
          <p>
            Excludes fields whose value is <C>None</C>.
          </p>
        </Box>
        <Hint>
          The difference between “unset” and “equal to the default” is subtle: choose what your function returns on the right,
          then flip each flag.
        </Hint>
      </div>
    ),
  },
  {
    id: 'item-example',
    title: 'Example: Excluding None and Defaults',
    subtitle: 'The Item model',
    Visual: ItemExampleVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = 0.0 # Default tax is 0.0

@app.get("/items/{item_id}", response_model=Item,
         response_model_exclude_none=True)
async def read_item(item_id: str):
    # Imagine fetching an item that has no description
    item_data = {"name": "Thingamajig", "price": 10.50,
                 "description": None, "tax": 0.0}
    return item_data`}</Pre>
        <p>
          In this example, using <C>response_model_exclude_none=True</C>, the response would omit the <C>description</C> field
          because its value is <C>None</C>. If <C>response_model_exclude_defaults=True</C> were also used, the <C>tax</C> field
          would also be omitted as its value (<C>0.0</C>) matches the default.
        </p>
        <p className="text-xs text-gray-400">
          <C>description=None</C> also equals its default, so <C>exclude_defaults</C> on its own would drop it too.
        </p>
        <Hint>Step through adding the flags one at a time and watch the payload shrink.</Hint>
      </div>
    ),
  },
  {
    id: 'multiple',
    title: 'Handling Multiple Response Types',
    subtitle: 'Union[SuccessResponse, ErrorResponse]',
    Visual: UnionResponseVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Sometimes, an endpoint might need to return different data structures depending on the outcome. A common way to
          handle this is using Python’s <C>Union</C> type hint in the <C>response_model</C>.
        </p>
        <Pre>{`from typing import Union

class SuccessResponse(BaseModel):
    message: str
    result_id: int

class ErrorResponse(BaseModel):
    error_code: int
    detail: str

@app.post("/process/", response_model=Union[SuccessResponse, ErrorResponse])
async def process_data(data: dict):
    try:
        # ... process data ...
        if success:
            return SuccessResponse(message="Processing successful", result_id=123)
        else:
            # This would typically be handled via HTTPException,
            # but illustrates returning a different model structure.
            return ErrorResponse(error_code=5001, detail="Processing failed")
    except Exception as e:
        return ErrorResponse(error_code=9999, detail=str(e))`}</Pre>
        <p>
          FastAPI will try to match the returned object against the types specified in the <C>Union</C> and{' '}
          <strong className="text-white">document both possibilities</strong> in the API schema.
        </p>
        <Box title="Prefer HTTPException for real errors" tone="amber">
          <p>
            For standard HTTP errors (like 4xx or 5xx), raising <C>HTTPException</C> is generally preferred over returning a
            custom error model in the success path.
          </p>
        </Box>
        <p>
          By defining clear response models, you enhance the <strong className="text-white">reliability, maintainability, and
          documentation</strong> of your ML APIs, ensuring that clients receive precisely the data they expect in the correct
          format. It’s a fundamental practice for building dependable web services.
        </p>
        <Hint>Try each outcome on the right. Notice the status code when the error model is returned.</Hint>
      </div>
    ),
  },
  {
    id: 'params-intro',
    title: 'Handling Path and Query Parameters',
    subtitle: 'Two ways to pass information in the URL',
    Visual: UrlAnatomyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          APIs often receive information directly through the URL. FastAPI provides a clear and efficient way to handle two
          primary types of URL parameters: <strong className="text-white">path parameters</strong> and{' '}
          <strong className="text-white">query parameters</strong>.
        </p>
        <p>
          Python type hints enable <strong className="text-white">automatic data validation and conversion</strong>, often
          working with Pydantic models for comprehensive data structuring and validation.
        </p>
        <Box title="Path parameters" tone="amber">
          <p>
            Variable segments embedded within the URL path, used to identify specific resources — e.g. <C>model_id</C> in{' '}
            <C>/models/{'{model_id}'}/predict</C>.
          </p>
        </Box>
        <Box title="Query parameters" tone="cyan">
          <p>
            Optional key-value pairs after <C>?</C>, separated by <C>&amp;</C>, used for filtering, sorting, or pagination —
            e.g. <C>/predictions?model_id=bert-base&amp;limit=10</C>.
          </p>
        </Box>
        <Hint>Click the coloured parts of each URL on the right, then try the quick path-or-query check.</Hint>
      </div>
    ),
  },
  {
    id: 'path-params',
    title: 'Defining and Validating Path Parameters',
    subtitle: 'GET /models/{model_id}',
    Visual: PathLookupVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Path parameters are variable segments embedded within the URL path. They are useful for identifying specific
          resources. For instance, in <C>/models/{'{model_id}'}/predict</C>, <C>model_id</C> is a path parameter intended to
          specify which machine learning model to use.
        </p>
        <p>
          You define path parameters using the same <strong className="text-white">curly brace syntax</strong> used in Python
          f-strings directly within the path string of your route decorator. You then declare the parameter in your path
          operation function using the <strong className="text-white">same name</strong> and adding a type hint.
        </p>
        <Pre>{`from fastapi import FastAPI, Path, HTTPException

app = FastAPI()

# A simple dictionary acting as a database for model metadata
model_db = {
    "resnet50": {"framework": "PyTorch", "task": "Image Classification"},
    "bert-base-uncased": {"framework": "Transformers", "task": "NLP"},
    "linear-reg-v1": {"framework": "Scikit-learn", "task": "Regression"}
}

@app.get("/models/{model_id}")
async def get_model_metadata(model_id: str):
    """
    Retrieve metadata for a specific model ID.
    Path parameter 'model_id' is automatically validated as a string.
    """
    if model_id not in model_db:
        raise HTTPException(status_code=404, detail=f"Model ID '{model_id}' not found.")
    return model_db[model_id]`}</Pre>
        <p>In this example:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            The path <C>@app.get("/models/{'{model_id}'}")</C> defines <C>model_id</C> as a path parameter.
          </li>
          <li>
            The function signature <C>async def get_model_metadata(model_id: str):</C> declares <C>model_id</C> as an argument
            with a type hint <C>str</C>.
          </li>
          <li>
            FastAPI automatically uses the type hint <C>str</C> to validate that the value in the URL path segment corresponding
            to <C>{'{model_id}'}</C> is indeed a string (though path parameters are always strings initially, FastAPI uses the
            type hint for documentation and potential future features).
          </li>
        </ol>
        <Box title="With int instead" tone="rose">
          <p>
            If you used <C>int</C> (<C>model_id: int</C>), FastAPI would automatically try to convert the path segment to an
            integer and raise a validation error (<strong className="text-white">HTTP 422 Unprocessable Entity</strong>) if it
            failed.
          </p>
        </Box>
        <Hint>Try an unknown id for the 404, then switch the hint to int and try “resnet50”.</Hint>
      </div>
    ),
  },
  {
    id: 'path-validation',
    title: 'More Validation with Path()',
    subtitle: 'Constraints and metadata for path parameters',
    Visual: PathConstraintVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          For more complex validation, you can use the <C>Path</C> function from FastAPI alongside the type annotation. This
          allows you to specify constraints like:
        </p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>minimum/maximum length,</li>
          <li>numeric constraints (greater than, less than),</li>
          <li>regular expressions,</li>
          <li>and metadata for documentation.</li>
        </ul>
        <Pre>{`@app.get("/items/{item_id}")
async def read_item(
    item_id: int = Path(
        ..., # The '...' indicates the parameter is required
        title="The ID of the item to get",
        ge=1 # 'ge' means 'greater than or equal to' 1
    )
):
    """
    Retrieves an item by its ID.
    'item_id' must be an integer >= 1.
    """
    # Example: Replace with actual item fetching logic
    if item_id > 100: # Simulate not found for IDs > 100
        raise HTTPException(status_code=404, detail=f"Item ID {item_id} not found.")
    return {"item_id": item_id, "name": f"Sample Item {item_id}"}`}</Pre>
        <p>
          Here, <C>Path(..., ge=1)</C> ensures <C>item_id</C> is required and must be an integer greater than or equal to 1.{' '}
          <strong className="text-white">FastAPI handles the validation before your function code even runs.</strong>
        </p>
        <Hint>Slide across the number line: below 1 is FastAPI’s 422, above 100 is your code’s 404.</Hint>
      </div>
    ),
  },
  {
    id: 'query-params',
    title: 'Defining and Validating Query Parameters',
    subtitle: 'Pagination and search',
    Visual: QueryBasicsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Query parameters are <strong className="text-white">optional key-value pairs</strong> appended to the URL after a
          question mark (<C>?</C>), separated by ampersands (<C>&amp;</C>). They are typically used for filtering, sorting, or
          pagination. For example, in <C>/predictions?model_id=bert-base&amp;limit=10</C>, <C>model_id</C> and <C>limit</C> are
          query parameters.
        </p>
        <p>
          In FastAPI, any function parameter declared in your path operation function that is <em>not</em> part of the path
          definition is automatically interpreted as a query parameter.
        </p>
        <Pre>{`from fastapi import FastAPI
from typing import Optional, List

app = FastAPI()

# Sample data for demonstration
fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]

@app.get("/items/")
async def read_items(skip: int = 0, limit: int = 10):
    """
    Retrieve items with optional pagination using query parameters.
    'skip' defaults to 0, 'limit' defaults to 10.
    """
    return fake_items_db[skip : skip + limit]

@app.get("/search/")
async def search_items(query: Optional[str] = None):
    """
    Search items based on an optional query string.
    'query' is an optional query parameter.
    """
    results = fake_items_db
    if query:
        results = [item for item in fake_items_db
                   if query.lower() in item["item_name"].lower()]
    return {"query": query, "results": results}`}</Pre>
        <Hint>Use the two tabs on the right: paginate with skip/limit, then search.</Hint>
      </div>
    ),
  },
  {
    id: 'query-rules',
    title: 'Important Points About Query Parameters',
    subtitle: 'Declaration, types, defaults, Optional, booleans',
    Visual: QueryRulesVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Declaration:</strong> Parameters like <C>skip: int</C> and <C>limit: int</C> are not
            in the path <C>/items/</C>, so FastAPI treats them as query parameters.
          </li>
          <li>
            <strong className="text-white">Type Hints:</strong> Type hints (<C>int</C>, <C>str</C>, <C>bool</C>, <C>float</C>,
            etc.) work just like with path parameters and request bodies, providing automatic data conversion and validation. If
            a user sends <C>/items/?skip=abc</C>, FastAPI will return a <strong className="text-white">422</strong> error because
            "abc" cannot be converted to an <C>int</C>.
          </li>
          <li>
            <strong className="text-white">Default Values:</strong> Providing a default value (e.g., <C>skip: int = 0</C>) makes
            the query parameter optional. If the client doesn’t provide it, the default value is used.
          </li>
          <li>
            <strong className="text-white">Optional Parameters:</strong> Use <C>Optional[Type]</C> or <C>Union[Type, None]</C>{' '}
            (equivalent in newer Python versions) and set the default value to <C>None</C> to make a parameter explicitly
            optional without a specific default other than <C>None</C>. (<C>query: Optional[str] = None</C>).
          </li>
          <li>
            <strong className="text-white">Boolean Conversion:</strong> FastAPI intelligently converts values like <C>true</C>,{' '}
            <C>True</C>, <C>1</C>, <C>on</C>, <C>yes</C> to <C>True</C>, and <C>false</C>, <C>False</C>, <C>0</C>, <C>off</C>,{' '}
            <C>no</C> to <C>False</C> for <C>bool</C> type hints.
          </li>
        </ul>
        <Hint>One tab per point on the right.</Hint>
      </div>
    ),
  },
  {
    id: 'query-validation',
    title: 'More Validation with Query()',
    subtitle: 'Constraints, metadata, and list values',
    Visual: QueryValidatorVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Similar to <C>Path</C>, FastAPI provides a <C>Query</C> function for adding more validation rules and metadata to query
          parameters.
        </p>
        <Pre>{`from fastapi import FastAPI, Query
from typing import Optional, List

app = FastAPI()

@app.get("/models/search/")
async def search_models(
    task: Optional[str] = None,
    framework: Optional[str] = Query(
        None, # Default value is None, making it optional
        min_length=3,
        max_length=50,
        regex="^(PyTorch|TensorFlow|Scikit-learn|Transformers)$", # Example regex
        title="ML Framework",
        description="Filter models by the ML framework (case-sensitive)."
    ),
    tags: List[str] = Query(
        [], # Default is an empty list for multiple values
        title="Tags",
        description="Provide tags to filter models (e.g., ?tags=nlp&tags=text-generation)"
    )
):
    """
    Search for models based on task, framework, and tags.
    Demonstrates advanced query validation and list parameters.
    """
    # In a real app, you'd filter based on these validated parameters
    return {
        "filters": {
            "task": task,
            "framework": framework,
            "tags": tags
        },
        "results": ["Model A", "Model B"] # Placeholder results
    }`}</Pre>
        <p>In this example:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <C>framework</C> uses <C>Query</C> to add length constraints and a regular expression for allowed values. It also
            includes <C>title</C> and <C>description</C> which enhance the auto-generated documentation.
          </li>
          <li>
            <C>tags</C> uses <C>List[str]</C> to accept multiple values for the same query parameter (e.g.,{' '}
            <C>/models/search/?tags=cv&amp;tags=classification</C>). <C>Query([])</C> sets the default to an empty list if no{' '}
            <C>tags</C> parameter is provided.
          </li>
        </ul>
        <p className="text-xs text-gray-400">
          In current FastAPI versions the argument is called <C>pattern=</C>; <C>regex=</C> still works but is deprecated.
        </p>
        <Hint>Try “pytorch” (wrong case), “TF” (too short), and add or remove tags on the right.</Hint>
      </div>
    ),
  },
  {
    id: 'summary',
    title: 'Declarations Become Validation and Docs',
    subtitle: 'Type hints, defaults, Optional, Path, and Query',
    Visual: ParamDocsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          By using <strong className="text-white">type hints, default values, <C>Optional</C>, <C>Path</C>, and <C>Query</C></strong>,
          you can define precise requirements for the data your API expects via the URL.
        </p>
        <Box title="Valid before your core logic" tone="teal">
          <p>
            This ensures that inputs are valid before they reach your core logic, which is particularly important when these
            parameters dictate how your ML models are queried or used.
          </p>
        </Box>
        <Box title="Automatic documentation" tone="sky">
          <p>FastAPI turns these declarations into validation and clear API documentation automatically.</p>
        </Box>
        <Hint>Browse the generated parameter docs on the right: every title, constraint, and description comes from the code.</Hint>
      </div>
    ),
  },
];

export default function DataHandlingAndValidationWithPydanticPartTwo() {
  return <ChapterDeck slides={slidesData} />;
}
