import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  HardcodeVisualizer,
  EnvGetVisualizer,
  StringTrapVisualizer,
  SettingsLoadVisualizer,
  StartupGateVisualizer,
  SettingsInjectVisualizer,
  GitignoreVisualizer,
  SecretFlowVisualizer,
  LogPartsVisualizer,
  BasicLogVisualizer,
  WhatToLogVisualizer,
  JsonLogVisualizer,
  CorrelationVisualizer,
} from '../components/ConfigLogVisualizers';

export const meta = {
  title: 'Structuring and Testing FastAPI Applications (Part 3)',
  subtitle: 'Settings, secrets, and logging',
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
    id: 'hardcode',
    title: 'Handling Configuration and Secrets',
    subtitle: 'A path baked into the file has to be edited to change',
    Visual: HardcodeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          As your FastAPI applications for serving machine learning models mature, you’ll find that certain values shouldn’t be
          hardcoded directly into your source files. Model paths, API keys for external services, database connection strings,
          logging levels, and other deployment-specific parameters often need to change between development, testing, and production
          environments without requiring code modifications. Handling these configurations and sensitive pieces of information, often
          called secrets, correctly is fundamental to building maintainable, flexible, and secure applications.
        </p>
        <p>
          Hardcoding configuration values directly in your code makes it brittle. Imagine needing to update the path to a retrained
          model or change a database password. You would have to modify the code, re-test, and redeploy the entire application.
          Furthermore, embedding sensitive information like API keys or passwords directly in your source code and committing it to
          version control systems like Git is a significant security risk. This section looks at common and effective methods for
          managing application configuration and secrets within FastAPI.
        </p>
        <Hint>Switch hardcoded and from outside, then try dev, test, and prod.</Hint>
      </div>
    ),
  },
  {
    id: 'environ',
    title: 'Using Environment Variables',
    subtitle: 'os.environ.get returns a string, or None',
    Visual: EnvGetVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          A widely adopted standard for providing configuration to applications is through environment variables. These are key-value
          pairs set in the operating system environment where your application runs. Most deployment platforms, including Docker
          containers, PaaS providers, and traditional servers, offer mechanisms to set environment variables for your application
          process.
        </p>
        <p>Python’s standard library provides the <C>os</C> module to access environment variables:</p>
        <Pre>{`import os

# Access an environment variable, providing a default if not set
model_path = os.environ.get("MODEL_PATH", "../models/default_model.joblib")
api_key = os.environ.get("EXTERNAL_API_KEY") # Returns None if not set

if api_key is None:
    print("Warning: EXTERNAL_API_KEY environment variable not set.")
    # Handle the missing item appropriately, maybe raise an error or disable features

print(f"Using model path: {model_path}")`}</Pre>
        <p>
          While straightforward, relying solely on <C>os.environ.get</C> has drawbacks. Environment variables are always strings, so
          you’ll need to manually perform type conversions (e.g., for port numbers or boolean flags) and validation. As the number
          of configuration parameters grows, managing them individually can become cumbersome.
        </p>
        <Hint>Turn MODEL_PATH and EXTERNAL_API_KEY on and off. The result on the right follows.</Hint>
      </div>
    ),
  },
  {
    id: 'strings',
    title: 'Drawbacks of os.environ.get',
    subtitle: 'Every value arrives as a string',
    Visual: StringTrapVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While straightforward, relying solely on <C>os.environ.get</C> has drawbacks. Environment variables are always strings, so
          you’ll need to manually perform type conversions (e.g., for port numbers or boolean flags) and validation. As the number
          of configuration parameters grows, managing them individually can become cumbersome.
        </p>
        <p>
          A non-empty string such as <C>"false"</C> is truthy in Python, so a boolean flag needs an explicit comparison. A port
          stored as <C>"8080"</C> cannot be added to a number until you cast it. A value that is not a number, such as <C>"four"</C>,
          raises <C>ValueError</C> inside <C>int()</C>. Each name needs its own check.
        </p>
        <Hint>Pick DEBUG_MODE, PORT, then MAX_WORKERS on the right.</Hint>
      </div>
    ),
  },
  {
    id: 'settings',
    title: 'Managing Settings with Pydantic',
    subtitle: 'BaseSettings reads the environment and checks the types',
    Visual: SettingsLoadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI integrates with Pydantic, and Pydantic offers a feature for managing application settings through its{' '}
          <C>BaseSettings</C> class. This approach combines the convenience of environment variables with the type safety and
          validation capabilities of Pydantic models.
        </p>
        <p>
          First, ensure you have <C>pydantic-settings</C> installed, which might be needed depending on your Pydantic version
          (Pydantic v2 separated this functionality):
        </p>
        <Pre>{`pip install pydantic-settings`}</Pre>
        <p>Now, you can define a settings class:</p>
        <Pre>{`from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class AppSettings(BaseSettings):
    # Define your configuration variables with type hints
    app_name: str = "ML Prediction Service"
    log_level: str = "INFO"
    model_path: str
    database_url: Optional[str] = None # Example optional setting
    external_api_key: str # Example required secret

    # Pydantic v2 configuration (if using pydantic-settings)
    model_config = SettingsConfigDict(
        # Load environment variables from a .env file if present
        # requires python-dotenv to be installed: pip install python-dotenv
        env_file='.env',
        env_file_encoding='utf-8',
        # Make environment variable matching case-insensitive
        case_sensitive=False
    )

# Instantiate settings - Pydantic automatically reads from environment variables
# and the specified .env file
settings = AppSettings()

# You can now access settings with type safety
print(f"App Name: {settings.app_name}")
print(f"Model Path: {settings.model_path}")
print(f"API Key first few chars: {settings.external_api_key[:4]}...") # Be careful logging secrets!`}</Pre>
        <p>
          Pydantic’s <C>BaseSettings</C> will automatically attempt to read values for the defined fields from environment variables.
          For example, it will look for an environment variable named <C>MODEL_PATH</C> (case-insensitivity can be configured) to
          populate the <C>model_path</C> attribute. If an <C>.env</C> file is specified and exists (useful for local development),
          variables defined there will also be loaded. Pydantic handles the type conversion and validation automatically. If a
          required variable (like <C>model_path</C> or <C>external_api_key</C> in the example) is not found either in the environment
          or the <C>.env</C> file, Pydantic will raise a validation error upon instantiation, preventing the application from
          starting with missing configuration.
        </p>
        <Box title="Current pydantic-settings" tone="amber">
          <p>
            <C>BaseSettings</C> lives in <C>pydantic-settings</C>, which is what this snippet imports. <C>case_sensitive=False</C> is
            already the default there. <C>Optional[str]</C> is the same as <C>str | None</C> on Python 3.10+. A missing <C>.env</C>{' '}
            file is skipped. Printing the first characters of the key still puts part of the secret in the logs.
          </p>
        </Box>
        <Hint>Click a field. The panel shows which environment name fills it.</Hint>
      </div>
    ),
  },
  {
    id: 'gate',
    title: 'Validation at Startup',
    subtitle: 'A missing required field stops the process',
    Visual: StartupGateVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`settings = AppSettings()

print(f"App Name: {settings.app_name}")
print(f"Model Path: {settings.model_path}")
print(f"API Key first few chars: {settings.external_api_key[:4]}...") # Be careful logging secrets!`}</Pre>
        <p>
          Pydantic’s <C>BaseSettings</C> reads each field from the environment, and from <C>.env</C> when that file exists. It looks
          for <C>MODEL_PATH</C> to fill <C>model_path</C>. Type conversion happens as part of that read. If a required field such as{' '}
          <C>model_path</C> or <C>external_api_key</C> is missing from both places, instantiation raises a validation error and the
          application does not start.
        </p>
        <Hint>Uncheck MODEL_PATH or EXTERNAL_API_KEY. LOG_LEVEL only changes the level that gets used.</Hint>
      </div>
    ),
  },
  {
    id: 'depends',
    title: 'Settings Through Depends',
    subtitle: 'One object, passed into the functions FastAPI calls',
    Visual: SettingsInjectVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>You can easily integrate these settings into your FastAPI application using dependency injection:</p>
        <Pre>{`from fastapi import FastAPI, Depends
# Assuming AppSettings is defined as above

settings = AppSettings()
app = FastAPI()

# Dependency function to provide settings
def get_settings() -> AppSettings:
    return settings

@app.get("/info")
async def info(current_settings: AppSettings = Depends(get_settings)):
    return {
        "app_name": current_settings.app_name,
        "model_path": current_settings.model_path,
        "log_level": current_settings.log_level
    }

# Example usage in another part of your application
def load_model(settings: AppSettings = Depends(get_settings)):
    # Load model using settings.model_path
    print(f"Loading model from: {settings.model_path}")
    # ... loading logic ...
    pass`}</Pre>
        <p>This approach keeps your configuration centralized, validated, and easily accessible throughout your application.</p>
        <Box title="Depends runs when FastAPI calls the function" tone="amber">
          <p>
            <C>/info</C> receives <C>settings</C> because it is a path operation. A direct <C>load_model()</C> call does not run{' '}
            <C>Depends</C>. Call it from a route, or pass the object yourself.
          </p>
        </Box>
        <Hint>Call GET /info, then load_model. Both receive the same settings object.</Hint>
      </div>
    ),
  },
  {
    id: 'gitignore',
    title: 'Handling Secrets Securely',
    subtitle: '.gitignore stops .env at the door of the commit',
    Visual: GitignoreVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Secrets are sensitive pieces of configuration like API keys, database passwords, or cryptographic keys.{' '}
          <strong className="text-white">Never commit secrets directly into your version control system (like Git).</strong> Even if
          the repository is private, it’s poor practice and increases the risk of accidental exposure.
        </p>
        <p>
          Using environment variables (managed via Pydantic <C>BaseSettings</C> or directly with <C>os.environ</C>) is a good first
          step for handling secrets. The actual values are injected into the application’s environment at runtime, keeping them out
          of the codebase.
        </p>
        <p>
          For local development, you can use a <C>.env</C> file to store secrets, but{' '}
          <strong className="text-white">ensure this .env file is listed in your .gitignore file</strong> to prevent accidental
          commits.
        </p>
        <Pre>{`# .gitignore
.env
*.pyc
__pycache__/`}</Pre>
        <Hint>Turn the .gitignore shield off, then open cloud, tool, and platform.</Hint>
      </div>
    ),
  },
  {
    id: 'runtime',
    title: 'Inject Secrets at Runtime',
    subtitle: 'The manager pours the key in when the process starts',
    Visual: SecretFlowVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          In production environments, managing secrets via environment variables is common, but better solutions often involve
          dedicated secret management systems. These systems provide centralized storage, access control, auditing, and rotation
          capabilities for secrets. Examples include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-white">Cloud Provider Solutions:</strong> AWS Secrets Manager, Google Secret Manager, Azure Key Vault.</li>
          <li><strong className="text-white">Dedicated Tools:</strong> HashiCorp Vault.</li>
          <li><strong className="text-white">Platform Integrations:</strong> Kubernetes Secrets, Docker Secrets.</li>
        </ul>
        <p>
          These tools typically inject secrets into the application environment (often as environment variables or mounted files)
          just before the application starts. While implementing these systems is outside the scope of this specific section, it’s
          important to be aware of them as your deployment needs become more complex. The principle remains the same: separate
          secrets from your code and inject them securely at runtime.
        </p>
        <p className="text-white">Configuration and secrets flow into the FastAPI application at runtime.</p>
        <p>
          By thoughtfully managing configuration and secrets, you create applications that are easier to deploy across different
          environments, simpler to maintain, and significantly more secure. Using Pydantic’s <C>BaseSettings</C> provides a
          convenient way to handle typed configuration loaded primarily from environment variables, aligning well with modern
          deployment practices.
        </p>
        <Hint>Follow the key from the manager, into the environment, through BaseSettings, and out to the route.</Hint>
      </div>
    ),
  },
  {
    id: 'log-parts',
    title: 'Logging in FastAPI Applications',
    subtitle: 'Logger, handler, formatter, filter',
    Visual: LogPartsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Effective logging is an indispensable part of building and maintaining reliable applications, especially when deploying
          machine learning models as APIs. When your prediction service is running in production, logs become your primary tool for
          understanding its behavior, diagnosing problems, monitoring performance, and tracking usage patterns. Without adequate
          logging, troubleshooting issues like unexpected prediction results, slow response times, or errors during inference can
          become a significant challenge.
        </p>
        <p>
          FastAPI applications, like any Python application, can leverage Python’s built-in <C>logging</C> module. This standard
          library provides a flexible and powerful framework for emitting log messages from your application components. The{' '}
          <C>logging</C> module involves a few main components:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Loggers:</strong> These are the objects your application code interacts with directly to
            emit messages (<C>logger.info(...)</C>, <C>logger.error(...)</C>, etc.). Loggers are typically named using a hierarchical
            structure, often mirroring your project’s module structure (e.g., <C>logging.getLogger(__name__)</C>).
          </li>
          <li>
            <strong className="text-white">Handlers:</strong> Handlers determine where the log messages are sent. Common handlers
            include <C>StreamHandler</C> (sends logs to <C>stderr</C> or <C>stdout</C>, which is typical for containerized
            applications), <C>FileHandler</C> (writes logs to a file), <C>SysLogHandler</C>, <C>HTTPHandler</C>, etc.
          </li>
          <li>
            <strong className="text-white">Formatters:</strong> Formatters control the final output format of log records. You can
            include timestamps, log levels, module names, specific message content, and more.
          </li>
          <li>
            <strong className="text-white">Filters:</strong> Filters provide fine-grained control over which log records are passed
            from loggers to handlers.
          </li>
        </ul>
        <p>
          While the ASGI server running your FastAPI application (like Uvicorn) often provides basic access logging (showing incoming
          requests, status codes, and timing), application-level logging provides deeper insights into the internal workings of your
          API, particularly the ML inference logic.
        </p>
        <Hint>Send logger.info and logger.debug. Raise the floor, then switch stdout and app.log.</Hint>
      </div>
    ),
  },
  {
    id: 'basic',
    title: 'Basic Logging Configuration',
    subtitle: 'INFO at startup, then info and error inside the routes',
    Visual: BasicLogVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          You can configure logging using Python code. For simple setups, <C>logging.basicConfig</C> can be sufficient, although it’s
          often better practice to use more structured configuration methods for complex applications.
        </p>
        <p>To start logging within your FastAPI application, you first need to get a logger instance, typically named after the current module:</p>
        <Pre>{`import logging
from fastapi import FastAPI

# Configure basic logging (optional, customize as needed)
# This is often done once at application startup
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Get a logger instance for the current module
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
async def read_root():
    logger.info("Root endpoint was accessed.")
    return {"message": "Hello World"}

@app.post("/predict/")
async def predict(data: dict): # Assuming a simple dict input for brevity
    logger.info(f"Prediction request received with data keys: {list(data.keys())}")
    try:
        # Placeholder for model inference
        prediction_result = {"prediction": "example_class", "probability": 0.95}
        logger.info(f"Prediction successful: {prediction_result}")
        return prediction_result
    except Exception as e:
        logger.error(f"Error during prediction: {e}", exc_info=True) # exc_info=True logs stack trace
        # Re-raise or return an appropriate error response
        raise e`}</Pre>
        <p>In this example:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>We import the <C>logging</C> module.</li>
          <li>
            <C>logging.basicConfig</C> sets the minimum log level to <C>INFO</C> and defines a basic message format. Messages below
            INFO (like DEBUG) will be ignored.
          </li>
          <li><C>logging.getLogger(__name__)</C> gets a logger specific to the module where it’s called.</li>
          <li>
            Inside the route handlers, <C>logger.info()</C> and <C>logger.error()</C> are used to record events. Using{' '}
            <C>exc_info=True</C> in <C>logger.error</C> automatically includes exception information and the stack trace, which is
            invaluable for debugging.
          </li>
        </ol>
        <Box title="basicConfig can do nothing" tone="amber">
          <p>
            If the root logger already has handlers, which Uvicorn sets up, <C>basicConfig</C> returns without changing them unless
            you pass <C>force=True</C>. <C>data: dict</C> accepts any JSON object, so this route does not validate a feature schema.
          </p>
        </Box>
        <Hint>Open /, a successful predict, then a failing one. Attach Uvicorn’s handler and basicConfig leaves the format alone until force=True.</Hint>
      </div>
    ),
  },
  {
    id: 'what',
    title: 'What and How to Log',
    subtitle: 'The password leaves. The prediction stays.',
    Visual: WhatToLogVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Deciding <em>what</em> to log is important. Aim for a balance between verbosity and utility. Logging too much can overwhelm
          storage and make finding relevant information difficult. Logging too little leaves you blind when problems occur. Log the
          following:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Request Information:</strong> Key details about incoming requests (e.g., relevant
            parameters, request IDs). Be extremely careful <em>not</em> to log sensitive information like passwords, API keys, or
            personally identifiable information (PII) unless absolutely necessary and properly secured/anonymized.
          </li>
          <li>
            <strong className="text-white">ML Inference:</strong> Log the input features (or a summary/hash if inputs are large), the
            prediction output, and potentially model confidence scores.
          </li>
          <li>
            <strong className="text-white">External Interactions:</strong> Calls to databases, other APIs, or file systems.
          </li>
          <li>
            <strong className="text-white">Errors and Exceptions:</strong> Always log errors with sufficient context, including stack traces.
          </li>
          <li>
            <strong className="text-white">Significant State Changes:</strong> Record important events or changes in application state.
          </li>
        </ul>
        <Hint>Open Request, ML inference, External call, Error, and State change. Each one shows the line you keep.</Hint>
      </div>
    ),
  },
  {
    id: 'json',
    title: 'Structured Logging',
    subtitle: 'The sentence becomes fields, then extra hangs more on',
    Visual: JsonLogVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While human-readable log formats are useful during development, structured logs (often in JSON format) are highly
          beneficial in production. They allow log messages to be easily parsed, indexed, and analyzed by log aggregation and
          monitoring systems (like Elasticsearch/Logstash/Kibana (ELK), Splunk, Datadog, etc.).
        </p>
        <p>You can configure Python’s logging to output JSON. Libraries like <C>python-json-logger</C> simplify this process.</p>
        <Pre>{`# Example setup using python-json-logger (install with: pip install python-json-logger)
import logging
from pythonjsonlogger import jsonlogger

# Get the root logger
log = logging.getLogger()
log.setLevel(logging.INFO)

# Create a handler that outputs to console (stderr)
logHandler = logging.StreamHandler()

# Use the JSON formatter
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
logHandler.setFormatter(formatter)

# Add the handler to the root logger
# Be careful not to add handlers multiple times if configuring elsewhere
if not log.hasHandlers():
    log.addHandler(logHandler)

# Get a logger instance for your application module
logger = logging.getLogger(__name__)

# --- FastAPI app definition ---
app = FastAPI()

@app.get("/status")
async def get_status():
    extra_data = {"service_version": "1.2.3", "uptime_seconds": 12345}
    logger.info("Status check performed", extra=extra_data)
    return {"status": "OK"}

# Example Log Output (JSON):
# {"asctime": "...", "levelname": "INFO", "name": "__main__", "message": "Status check performed", "service_version": "1.2.3", "uptime_seconds": 12345}`}</Pre>
        <p>Using the <C>extra</C> dictionary allows you to add custom fields to your structured log records easily.</p>
        <Box title="The import moved" tone="amber">
          <p>
            Current <C>python-json-logger</C> uses <C>from pythonjsonlogger.json import JsonFormatter</C>. The course import{' '}
            <C>from pythonjsonlogger import jsonlogger</C> matches older releases. <C>FastAPI</C> is used in this snippet and is not
            imported here.
          </p>
        </Box>
        <Hint>The console prints one JSON object and the aggregator indexes each field. Turn extra on, then turn the hasHandlers guard off.</Hint>
      </div>
    ),
  },
  {
    id: 'correlation',
    title: 'Correlation IDs',
    subtitle: 'One id stays on every line from a single request',
    Visual: CorrelationVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          In a system handling multiple concurrent requests, associating log messages belonging to the same request can be difficult.
          A common pattern is to assign a unique <em>correlation ID</em> to each incoming request and include this ID in every log
          message generated while processing that request. This makes tracing the entire lifecycle of a specific request through your
          logs much simpler.
        </p>
        <p>
          FastAPI middleware is a suitable place to generate and manage correlation IDs, potentially storing them in a request context
          or passing them explicitly. Libraries like <C>asgi-correlation-id</C> can help implement this pattern.
        </p>
        <p>
          Implementing logging might seem like extra effort initially, but it pays significant dividends when you need to understand,
          troubleshoot, and maintain your ML API in production. By configuring appropriate log levels, formats (preferably structured),
          and logging relevant information at critical points in your code, you enhance the observability and reliability of your
          FastAPI application.
        </p>
        <Hint>Turn the middleware on. Then filter to Client A, Client B, and Client C.</Hint>
      </div>
    ),
  },
];

export default function StructuringAndTestingFastAPIApplicationsPartThree() {
  return <ChapterDeck slides={slidesData} />;
}
