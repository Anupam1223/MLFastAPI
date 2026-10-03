import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  GarbageInVisualizer,
  ImperativeVsDeclarativeVisualizer,
  InputFeaturesVisualizer,
  AdvantagesVisualizer,
  ValidationFlowVisualizer,
  BeyondBasicsVisualizer,
  ModelBuilderVisualizer,
} from '../components/PydanticPart1IntroVisualizers';
import {
  AdPredictionVisualizer,
  FastAPIUsesModelVisualizer,
  RequestBodyCodeVisualizer,
  BodyPipelineVisualizer,
  ValidRequestVisualizer,
  InvalidRequestVisualizer,
  DocsSchemaVisualizer,
} from '../components/PydanticPart1BodyVisualizers';

export const meta = {
  title: 'Data Handling and Validation with Pydantic (Part 1)',
  subtitle: 'Pydantic models, request body validation, and readable errors',
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
    id: 'why',
    title: 'Introduction to Pydantic',
    subtitle: 'Your API is only as reliable as the data it accepts',
    Visual: ImperativeVsDeclarativeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The reliability of your machine learning API depends heavily on the{' '}
          <strong className="text-white">quality and structure of the data it receives</strong>.
        </p>
        <Box title="What bad data does" tone="rose">
          <p>Sending incorrectly formatted or typed data to your ML model can cause:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>unexpected errors,</li>
            <li>inaccurate predictions,</li>
            <li>or even service disruptions.</li>
          </ul>
        </Box>
        <p>
          Writing code by hand to check every field, type, and constraint of incoming requests is{' '}
          <strong className="text-white">tedious, error-prone, and clutters your core application logic</strong>.
        </p>
        <Box title="This is where Pydantic comes in" tone="teal">
          <p>
            <strong className="text-white">Pydantic</strong> is a Python library designed specifically for{' '}
            <strong className="text-white">data validation and settings management</strong> using standard Python type
            annotations.
          </p>
          <p>Instead of writing imperative validation code like:</p>
          <Pre>{`if not isinstance(data['age'], int):
    raise ValueError(...)`}</Pre>
          <p>
            …you <strong className="text-white">declaratively</strong> define the <em>shape</em> your data should have.
          </p>
        </Box>
        <Hint>
          On the right: the same rules written by hand vs declared as a shape. Tick more rules and compare how each version
          grows. The next slide explains how that declared class works.
        </Hint>
      </div>
    ),
  },
  {
    id: 'blueprint',
    title: 'Pydantic Models: a Blueprint for Your Data',
    subtitle: 'A class that inherits from BaseModel, with type hints',
    Visual: ModelBuilderVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Pydantic uses <strong className="text-white">type hints</strong> to parse and validate data. You define a data
          structure by creating a class that inherits from Pydantic’s <C>BaseModel</C>. Its attributes are declared with
          standard Python types (like <C>int</C>, <C>float</C>, <C>str</C>, <C>list</C>, <C>dict</C>) as type hints.
        </p>
        <p>
          FastAPI relies heavily on Pydantic for data validation. At the core of this system are{' '}
          <strong className="text-white">Pydantic models</strong>: Python classes you define to specify the structure and
          data types of the information your API expects to <strong className="text-white">receive or send</strong>.
        </p>
        <Box title="Think of it as a blueprint" tone="teal">
          <p>By defining a model, you declare the “shape” of the data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>the <strong className="text-white">names of the fields</strong> (the keys in a JSON object, for example),</li>
            <li>
              the <strong className="text-white">expected Python type</strong> of each field’s value, like <C>int</C>,{' '}
              <C>float</C>, <C>str</C>, <C>bool</C>, or more complex types like <C>List</C> or other Pydantic models.
            </li>
          </ul>
        </Box>
        <Hint>Build a model on the right. The JSON shape it expects updates as you add fields. Next: a real example.</Hint>
      </div>
    ),
  },
  {
    id: 'input-features',
    title: 'A First Example: InputFeatures',
    subtitle: 'Four required floats and an optional list',
    Visual: InputFeaturesVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>A simple example illustrating the concept:</p>
        <Pre>{`from pydantic import BaseModel
from typing import List

class InputFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float
    tags: List[str] = [] # Optional list of strings with default`}</Pre>
        <ul className="list-disc pl-5 space-y-1">
          <li>Four measurements, each declared as <C>float</C>, with no default, so each is <strong className="text-white">required</strong>.</li>
          <li><C>tags</C> is a list of strings with a default of <C>[]</C>, so it is <strong className="text-white">optional</strong>.</li>
        </ul>
        <p>
          Pydantic doesn’t only check types; it <strong className="text-white">parses</strong> them. A clean numeric string
          like <C>"5.1"</C> becomes the float <C>5.1</C>, while <C>"long"</C> is rejected.
        </p>
        <Hint>Edit the JSON on the right and watch every field get checked live.</Hint>
      </div>
    ),
  },
  {
    id: 'guard',
    title: 'InputFeatures as a Guard',
    subtitle: 'The same bad request, with and without a model',
    Visual: GarbageInVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Remember what bad data does to an ML API: unexpected errors, inaccurate predictions, service disruptions. Here is
          that in practice, with an iris <C>/predict</C> endpoint written two ways.
        </p>
        <Box title="Without validation: data: dict" tone="rose">
          <p>
            Text instead of numbers, missing keys, or the wrong structure crash deep inside NumPy. The client gets a vague{' '}
            <strong className="text-white">500</strong>. Worse, an impossible value can produce a confident but meaningless
            prediction that nobody notices.
          </p>
        </Box>
        <Box title="With a model: features: InputFeatures" tone="teal">
          <p>
            Using the model from the previous slide as the parameter type, FastAPI validates the data first. Bad data is
            rejected with a <strong className="text-white">422</strong> that names the field and the reason, and your model
            only ever sees valid, typed input.
          </p>
        </Box>
        <p className="text-xs text-gray-400">
          Types are not everything: a negative petal width is still a valid float. Rules like “must be positive” need
          constraints, which come up in Request Body Validation.
        </p>
        <Hint>Send each payload on the right and compare the two APIs.</Hint>
      </div>
    ),
  },
  {
    id: 'advantages',
    title: 'Why Pydantic Matters in FastAPI',
    subtitle: 'Four major advantages',
    Visual: AdvantagesVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="Automatic Data Validation" tone="teal">
          <p>
            When you declare a Pydantic model as the type hint for a request body parameter, FastAPI automatically reads the
            request body (e.g. JSON), parses it, and validates it against your model. If the data doesn’t conform, FastAPI
            returns a standardized <strong className="text-white">HTTP 422 (Unprocessable Entity)</strong> error detailing the
            problems, so invalid data never reaches your application logic.
          </p>
        </Box>
        <Box title="Data Serialization" tone="amber">
          <p>
            Pydantic models serialize data (Python objects → formats like JSON) as easily as they parse it. FastAPI uses this
            when you define a <C>response_model</C>, so outgoing data also follows a specific structure.
          </p>
        </Box>
        <Box title="Improved Development Experience" tone="violet">
          <p>
            Type hints make code more readable and maintainable. Modern IDEs use them for better autocompletion, static
            analysis, and refactoring, catching potential type errors before runtime.
          </p>
        </Box>
        <Box title="Automatic API Documentation" tone="cyan">
          <p>
            FastAPI introspects your Pydantic models to generate <strong className="text-white">JSON Schema</strong>{' '}
            definitions, which power the interactive docs (Swagger UI, ReDoc). They clearly show consumers the expected
            request and response formats.
          </p>
        </Box>
      </div>
    ),
  },
  {
    id: 'flow',
    title: 'Pydantic’s Role in Request Validation',
    subtitle: 'Valid → Python object; invalid → 422',
    Visual: ValidationFlowVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Data flows from the client to FastAPI. <strong className="text-white">Pydantic intercepts the incoming data</strong>{' '}
          and validates it against the defined model.
        </p>
        <Box title="Validation success" tone="emerald">
          <p>
            A validated Python object is passed to your application logic (e.g. ML inference). Your logic processes it and
            generates the response data, which FastAPI sends back as the HTTP response.
          </p>
        </Box>
        <Box title="Validation failure" tone="rose">
          <p>
            An <strong className="text-white">HTTP 422</strong> error response is generated with the error details and sent
            back to the client. Your API logic is never called.
          </p>
        </Box>
        <Hint>Follow both paths through the diagram on the right: the valid one reaches your logic; the invalid one never does.</Hint>
      </div>
    ),
  },
  {
    id: 'basemodel',
    title: 'Defining Data Models with BaseModel',
    subtitle: 'AdPredictionInput, field by field',
    Visual: AdPredictionVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          You have seen why models matter and what they give you in FastAPI. Now let’s define one properly, field by field,
          using the ad-click inputs from the first slide.
        </p>
        <p>
          To define a data model, create a class that inherits from Pydantic’s <C>BaseModel</C>, and declare attributes with
          standard Python type annotations.
        </p>
        <p>
          Example: a machine learning model predicts whether a customer will click an ad, based on their age and previous
          interaction history (a boolean). The input model:
        </p>
        <Pre>{`from pydantic import BaseModel

class AdPredictionInput(BaseModel):
    age: int
    previous_interaction: bool
    campaign_id: str | None = None # Optional field with a default value`}</Pre>
        <ul className="list-disc pl-5 space-y-1">
          <li>It inherits from <C>BaseModel</C>.</li>
          <li>It defines three fields: <C>age</C>, <C>previous_interaction</C>, and <C>campaign_id</C>.</li>
          <li><C>age</C> is declared as <C>int</C>, so Pydantic (and FastAPI) expect an integer value.</li>
          <li><C>previous_interaction</C> is a <C>bool</C>, expecting a boolean (<C>true</C> or <C>false</C> in JSON).</li>
          <li>
            <C>campaign_id</C> uses <C>str | None = None</C>: it expects a string but is optional. If it’s not provided, it
            defaults to <C>None</C>.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'fastapi-uses',
    title: 'How FastAPI Uses These Models',
    subtitle: 'Five things happen automatically',
    Visual: FastAPIUsesModelVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          When you use a model like <C>AdPredictionInput</C> as the type hint for a parameter of a path operation function,
          FastAPI automatically:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li><strong className="text-white">Reads the Request Body</strong>: it expects the request to have a JSON body.</li>
          <li><strong className="text-white">Parses the JSON</strong>: it converts the JSON data into Python objects.</li>
          <li>
            <strong className="text-white">Validates the Data</strong>: it checks that the data matches the structure and types
            of <C>AdPredictionInput</C>:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>Does the JSON contain fields named <C>age</C> and <C>previous_interaction</C>?</li>
              <li>Is the value for <C>age</C> an integer (or convertible to one)?</li>
              <li>Is the value for <C>previous_interaction</C> a boolean (or convertible to one)?</li>
              <li>If <C>campaign_id</C> is present, is it a string?</li>
            </ul>
          </li>
          <li><strong className="text-white">Provides Data</strong>: on success, it passes the validated data as an instance of your model to your function.</li>
          <li>
            <strong className="text-white">Generates Errors</strong>: on failure (missing required fields, wrong types), it
            automatically returns a detailed JSON error, with no error-handling code from you.
          </li>
        </ol>
        <p>
          This declarative approach simplifies validation a lot: you define the structure once, FastAPI enforces it, and your
          endpoints stay focused on the core logic, like calling your ML model.
        </p>
      </div>
    ),
  },
  {
    id: 'request-body',
    title: 'Request Body Validation',
    subtitle: 'A Pydantic model as a function parameter',
    Visual: RequestBodyCodeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Validating incoming data is fundamental for reliable APIs, especially ones serving ML models. The data’s structure
          and types must match what your model expects <strong className="text-white">before</strong> any processing or
          prediction.
        </p>
        <p>
          When a path operation (like a POST or PUT handler) expects data in the request body, declare a function parameter
          whose <strong className="text-white">type hint is your Pydantic model</strong>. FastAPI uses that hint to handle
          request body validation automatically.
        </p>
        <Box title="The example" tone="teal">
          <ul className="list-disc pl-5 space-y-1">
            <li><C>ModelInput</C> defines the features for a prediction task.</li>
            <li><C>feature_beta: int = Field(gt=0, description=...)</C> adds a constraint: it must be positive.</li>
            <li><C>optional_param: Optional[float] = None</C> is optional (or write <C>float | None = None</C>).</li>
            <li>
              <C>process_data_endpoint(input_data: ModelInput)</C> receives the validated body. If the code gets that far,{' '}
              <C>input_data</C> is guaranteed to be a valid <C>ModelInput</C>.
            </li>
            <li>Fields are accessed directly: <C>input_data.feature_alpha * input_data.feature_beta</C>.</li>
          </ul>
        </Box>
        <Hint>Step through the full main.py on the right, line by line.</Hint>
      </div>
    ),
  },
  {
    id: 'pipeline',
    title: 'What FastAPI Does at /process_data/',
    subtitle: 'Read → parse → validate → inject, or 422',
    Visual: BodyPipelineVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>When a POST request hits <C>/process_data/</C>, FastAPI automatically:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li><strong className="text-white">Reads the Request Body</strong>: the raw bytes.</li>
          <li><strong className="text-white">Parses JSON</strong>: into a Python dictionary.</li>
          <li>
            <strong className="text-white">Validates with Pydantic</strong>: it tries to create a <C>ModelInput</C> instance,
            which runs all of the model’s checks:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>required fields (<C>feature_alpha</C>, <C>feature_beta</C>, <C>category</C>) are present,</li>
              <li>data types match the annotations (<C>float</C>, <C>int</C>, <C>str</C>),</li>
              <li>additional constraints hold (like <C>gt=0</C> for <C>feature_beta</C>).</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Injects Validated Data</strong>: it creates the <C>ModelInput</C> instance and passes
            it as the <C>input_data</C> argument. Your code can safely use it, knowing it matches the schema.
          </li>
          <li>
            <strong className="text-white">Handles Validation Errors</strong>: if parsing fails or the data doesn’t match
            (missing field, wrong type, <C>feature_beta &gt; 0</C> violated), FastAPI stops and returns{' '}
            <C>422 Unprocessable Entity</C>, pinpointing which fields failed and why.
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: 'valid',
    title: 'Example: Valid Request',
    subtitle: '200 OK with the processed result',
    Visual: ValidRequestVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Send a POST request to <C>/process_data/</C> with this JSON body:</p>
        <Pre>{`{
  "feature_alpha": 10.5,
  "feature_beta": 5,
  "category": "A",
  "optional_param": 99.9
}`}</Pre>
        <p>
          FastAPI validates it against <C>ModelInput</C>. <C>process_data_endpoint</C> runs, receiving a <C>ModelInput</C>{' '}
          instance, and the client gets a <C>200 OK</C> response similar to:
        </p>
        <Pre>{`{
  "status": "success",
  "processed_result": 52.5,
  "received_data": {
    "feature_alpha": 10.5,
    "feature_beta": 5,
    "category": "A",
    "optional_param": 99.9
  }
}`}</Pre>
        <p>
          <C>52.5</C> is <C>10.5 × 5</C>. <C>received_data</C> is the model instance, turned back into JSON by FastAPI.
        </p>
      </div>
    ),
  },
  {
    id: 'invalid',
    title: 'Example: Invalid Request',
    subtitle: 'Two problems, one clear 422',
    Visual: InvalidRequestVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Now send a POST request with an invalid body:</p>
        <Pre>{`{
  "feature_alpha": "not-a-float",
  "category": "B"
}`}</Pre>
        <p>It is invalid for two reasons:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><C>feature_alpha</C> is a string instead of a float,</li>
          <li>the required <C>feature_beta</C> field is missing.</li>
        </ul>
        <p>
          FastAPI catches both and returns <C>422 Unprocessable Entity</C> with one entry per problem, e.g.{' '}
          <C>{'"loc": ["body", "feature_alpha"], "msg": "value is not a valid float"'}</C> and{' '}
          <C>{'"loc": ["body", "feature_beta"], "msg": "field required"'}</C>.
        </p>
        <Box title="Read the error" tone="amber">
          <p>
            The response shows the <strong className="text-white">location</strong> (<C>loc</C>) and{' '}
            <strong className="text-white">reason</strong> (<C>msg</C>, <C>type</C>) of each validation failure in the request
            body. This immediate, detailed feedback is invaluable for API clients during development and debugging.
          </p>
        </Box>
        <p className="text-xs text-gray-400">
          The course text shows the Pydantic v1 wording. Current FastAPI (Pydantic v2) returns the same information with newer
          messages; the toggle on the right shows both.
        </p>
      </div>
    ),
  },
  {
    id: 'benefits',
    title: 'Validated, Typed, Self-Documenting',
    subtitle: 'What request body models give you',
    Visual: DocsSchemaVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>By simply using Pydantic models as type hints for request body parameters, you gain:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-white">automatic, declarative data validation</strong> with clear error reporting,</li>
          <li><strong className="text-white">much less boilerplate code</strong>,</li>
          <li><strong className="text-white">more reliable API endpoints</strong>.</li>
        </ul>
        <p>
          The data reaching your application logic, and potentially your machine learning models, is structured and typed
          correctly.
        </p>
        <Box title="Self-documenting" tone="cyan">
          <p>
            FastAPI also uses these models to automatically generate <strong className="text-white">schemas</strong> for your
            API documentation (like Swagger UI), so your API documents its expected request formats by itself.
          </p>
        </Box>
        <Hint>Click fields in the model on the right to find them in the generated schema, then use Try it out.</Hint>
      </div>
    ),
  },
  {
    id: 'beyond',
    title: 'What’s Next: Beyond Basic Types',
    subtitle: 'What the following sections cover',
    Visual: BeyondBasicsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          So far, every model has relied on basic type validation, plus one constraint (<C>Field(gt=0)</C>). Basic type
          validation is powerful, but Pydantic offers much more. You can:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>define complex <strong className="text-white">nested structures</strong>,</li>
          <li>add <strong className="text-white">constraints</strong> (like value ranges or string lengths),</li>
          <li>define <strong className="text-white">default values</strong>,</li>
          <li>create <strong className="text-white">custom validation logic</strong>,</li>
          <li>and manage <strong className="text-white">application settings</strong>.</li>
        </ul>
        <p>
          These capabilities make it an indispensable tool for building well-defined, reliable APIs, especially ones that
          handle structured data for machine learning models.
        </p>
        <p>
          The following sections explore each of these in detail, starting with basic structures and gradually moving toward
          the more complex data typical of ML applications.
        </p>
        <Hint>Try a small preview of each capability on the right.</Hint>
      </div>
    ),
  },
];

export default function DataHandlingAndValidationWithPydantic() {
  return <ChapterDeck slides={slidesData} />;
}
