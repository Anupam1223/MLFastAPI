import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  BuildStepsVisualizer,
  RunOptionsVisualizer,
  ManageContainerVisualizer,
  SlowCopyVisualizer,
  FastCopyVisualizer,
  PinVisualizer,
  NoVenvVisualizer,
  EnvLaunchVisualizer,
  OsEnvironVisualizer,
  SettingsFillVisualizer,
  InfoEndpointVisualizer,
  EnvSourceVisualizer,
  InspectSecretVisualizer,
} from '../components/DockerPrepPartTwoVisualizers';

export const meta = {
  title: 'Containerization and Deployment Preparation (Part 2)',
  subtitle: 'build the image, run it, pin dependencies, and pass configuration in',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;
const Pre = CodeBlock;
const Box = ({ title, children }) => (
  <div className="space-y-1.5 rounded-lg border border-gray-700 border-l-4 border-l-amber-400 bg-gray-800/30 p-3">
    {title && <p className="font-semibold text-white">{title}</p>}
    {children}
  </div>
);
const Hint = ({ children }) => <p className="text-xs text-gray-400">{children}</p>;

const slidesData = [
  {
    id: 'build',
    title: 'Building the Docker Image with docker build',
    subtitle: 'Context goes to the daemon, instructions become layers, -t names the result',
    Visual: BuildStepsVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          A <C>Dockerfile</C> serves as the blueprint for a containerized FastAPI application. From this blueprint, an actual
          image can be constructed, and a container can then be launched based on that image. This process involves two primary
          Docker commands: <C>docker build</C> and <C>docker run</C>.
        </p>
        <p>
          The <C>docker build</C> command is used to create a Docker image from a <C>Dockerfile</C> and a “context”. The context
          is the set of files located in the specified <C>PATH</C> or <C>URL</C>. These files are sent to the Docker daemon
          during the build process.
        </p>
        <p>The most common syntax you’ll use is:</p>
        <Pre>{`docker build -t <image_name>:<tag> <path_to_build_context>`}</Pre>
        <p>Let’s break down the components:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><C>docker build</C>: The command itself.</li>
          <li>
            <C>-t &lt;image_name&gt;:&lt;tag&gt;</C>: This option, short for <C>--tag</C>, is fundamental. It allows you to assign
            a human-readable name and tag to your image. The format is typically <C>repository_name:tag</C>.
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li><C>repository_name</C>: Often reflects the application name, like <C>fastapi-ml-api</C>.</li>
              <li>
                <C>tag</C>: Represents a specific version or variant, such as <C>v1.0</C>, <C>latest</C>, or a Git commit hash.
                Using <C>latest</C> is common but should be used thoughtfully in production environments where specific versions
                are preferred for reproducibility.
              </li>
              <li>
                Example: <C>-t fastapi-ml-api:latest</C> or <C>-t mycompany/prediction-service:0.1.0</C>. Tagging makes it much
                easier to manage and reference your images later.
              </li>
            </ul>
          </li>
          <li>
            <C>&lt;path_to_build_context&gt;</C>: This specifies the location of your <C>Dockerfile</C> and the application files
            it needs (like your Python code, <C>requirements.txt</C>, and potentially model artifacts if copied directly). Most
            frequently, you’ll run this command from the root directory of your project, where the <C>Dockerfile</C> resides, so
            the path is simply <C>.</C> (representing the current directory).
          </li>
        </ul>
        <p>When you execute <C>docker build</C>, the Docker daemon performs the following:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Sends the build context (all files in the specified path) to the daemon. Be mindful of large files in your context
            that aren’t needed for the build; use a <C>.dockerignore</C> file (similar to <C>.gitignore</C>) to exclude them and
            speed up the build.
          </li>
          <li>Reads the <C>Dockerfile</C>.</li>
          <li>Executes each instruction in the <C>Dockerfile</C> sequentially. Each instruction typically creates a new layer in the image.</li>
          <li>
            Uses build cache: If an instruction and its input files haven’t changed since a previous build, Docker reuses the
            existing layer from the cache, significantly speeding up subsequent builds. This highlights the importance of
            ordering instructions in your <C>Dockerfile</C> effectively (e.g., copying dependencies and installing them before
            copying application code that changes more frequently).
          </li>
          <li>
            Outputs the ID of the newly built image upon successful completion. If you used the <C>-t</C> flag, it also associates
            your chosen name and tag with this image ID.
          </li>
        </ol>
        <p className="font-semibold text-white">Example:</p>
        <p>
          Assuming your <C>Dockerfile</C> is in the current directory along with your application code (<C>main.py</C>,{' '}
          <C>requirements.txt</C>, model files, etc.), you would build the image like this:
        </p>
        <Pre>{`docker build -t fastapi-ml-api:latest .`}</Pre>
        <p>
          You’ll see output detailing each step of the build process. Once finished, you can list your local images using{' '}
          <C>docker images</C> to see <C>fastapi-ml-api</C> with the <C>latest</C> tag.
        </p>
        <Hint>Step through the context, the daemon, the layers, and the named image. The two tag buttons change only the name on the finished image.</Hint>
      </div>
    ),
  },
  {
    id: 'run',
    title: 'Running the Docker Container with docker run',
    subtitle: 'Publish a port, detach, name it, pass an environment variable',
    Visual: RunOptionsVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Now that you have a Docker image containing your FastAPI application, its dependencies, and the ML model, you can create
          and start a container from it using the <C>docker run</C> command.
        </p>
        <p>The basic syntax is:</p>
        <Pre>{`docker run [OPTIONS] <image_name>:<tag>`}</Pre>
        <p>Here are some essential options (<C>[OPTIONS]</C>) you’ll frequently use:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <C>-p &lt;host_port&gt;:&lt;container_port&gt;</C>: This is the port mapping option, short for <C>--publish</C>. It
            connects a port on your host machine to a port inside the container.
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <C>container_port</C>: The port your application is listening on inside the container (e.g., the port specified in
                your <C>CMD</C> instruction like <C>uvicorn main:app --host 0.0.0.0 --port 80</C>). Using <C>0.0.0.0</C> as the
                host inside the container makes it accessible from outside the container’s network namespace.
              </li>
              <li><C>host_port</C>: The port you will use to access the application from your host machine’s browser or tools like <C>curl</C>.</li>
              <li>
                Example: <C>-p 8000:80</C> maps port 8000 on your host to port 80 inside the container. You would then access your
                API at <C>http://localhost:8000</C>.
              </li>
            </ul>
          </li>
          <li>
            <C>-d</C>: This runs the container in detached mode, meaning it runs in the background, and your terminal is freed up.
            Without <C>-d</C>, your terminal will be attached to the container’s output (logs).
          </li>
          <li>
            <C>--name &lt;container_name&gt;</C>: Assigns a specific name to your running container. If you don’t provide one,
            Docker generates a random name. Naming containers makes them easier to manage (e.g., stop, remove, inspect). Example:{' '}
            <C>--name ml_api_instance_1</C>.
          </li>
          <li>
            <C>-e &lt;VARIABLE_NAME&gt;=&lt;value&gt;</C>: Sets an environment variable inside the container. This is a standard
            way to pass configuration settings to your application, as discussed in the next section. Example:{' '}
            <C>-e MODEL_PATH=/app/models/model.pkl</C>.
          </li>
          <li>
            <C>--rm</C>: Automatically removes the container when it exits. Useful for temporary containers or during development
            to avoid cluttering your system with stopped containers.
          </li>
        </ul>
        <Hint>Four pictures for -p. The pipe is missing until you turn it on. 8000:80 only works when the right number matches uvicorn --port. 0.0.0.0 opens the container door.</Hint>
      </div>
    ),
  },
  {
    id: 'manage',
    title: 'Verifying and Managing Containers',
    subtitle: 'ps, logs, stop, start, and rm',
    Visual: ManageContainerVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p className="font-semibold text-white">Example:</p>
        <p>
          To run a container based on the image we built earlier, mapping host port 8000 to container port 80 (assuming your{' '}
          <C>Dockerfile</C>’s <C>CMD</C> runs Uvicorn on port 80), and running it in detached mode:
        </p>
        <Pre>{`docker run -d -p 8000:80 --name my_api fastapi-ml-api:latest`}</Pre>
        <p>After running this command, Docker will output the unique ID of the newly started container.</p>
        <p className="font-semibold text-white">Verifying and Managing Containers</p>
        <p>Once your container is running (especially in detached mode), you’ll want to interact with it:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Check running containers:</span> Use <C>docker ps</C>. This lists all
            currently running containers, showing their IDs, names, image origin, status, ports, etc. Add the <C>-a</C> flag
            (<C>docker ps -a</C>) to see all containers, including stopped ones.
          </li>
          <li>
            <span className="font-semibold text-white">View logs:</span> If running detached, you can view the application logs
            (stdout/stderr from Uvicorn) using <C>docker logs &lt;container_name_or_id&gt;</C>. Use the <C>-f</C> flag
            (<C>docker logs -f &lt;container_name_or_id&gt;</C>) to follow the logs in real-time.
          </li>
          <li><span className="font-semibold text-white">Stop a container:</span> Use <C>docker stop &lt;container_name_or_id&gt;</C>.</li>
          <li><span className="font-semibold text-white">Start a stopped container:</span> Use <C>docker start &lt;container_name_or_id&gt;</C>.</li>
          <li>
            <span className="font-semibold text-white">Remove a container:</span> Use <C>docker rm &lt;container_name_or_id&gt;</C>.
            You usually need to stop a container before removing it, unless you use the force flag <C>-f</C>. Using{' '}
            <C>docker run --rm</C> avoids needing to do this manually.
          </li>
          <li>
            <span className="font-semibold text-white">Access the API:</span> With the example <C>docker run</C> command above, you
            should be able to access your API endpoints via <C>http://localhost:8000</C> (e.g., <C>http://localhost:8000/docs</C>{' '}
            for the Swagger UI) from your host machine.
          </li>
        </ul>
        <p>
          Using <C>docker build</C> and <C>docker run</C> forms the core workflow for transforming your application code and{' '}
          <C>Dockerfile</C> into a running, isolated service. By building an image, you package the application and all its
          dependencies, including the specific Python interpreter and the ML model itself. Running this image as a container
          provides a consistent environment, ensuring your application behaves the same way regardless of where the container is
          deployed.
        </p>
        <Hint>The container starts running. Try ps, then ps -a after stop. rm while it is running tells you to stop it first.</Hint>
      </div>
    ),
  },
  {
    id: 'slow-copy',
    title: 'Managing Python Dependencies within Docker',
    subtitle: 'COPY . . before pip install rebuilds the install on every code change',
    Visual: SlowCopyVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Effectively managing your Python dependencies is fundamental to creating reliable and reproducible Docker images for
          your FastAPI application. When you run <C>pip install -r requirements.txt</C> locally, you install packages into your
          current environment. Inside a Docker container, you need to replicate this process consistently every time the image is
          built.
        </p>
        <p>
          The most straightforward approach involves copying your <C>requirements.txt</C> file into the image and then running{' '}
          <C>pip install</C>:
        </p>
        <Pre>{`# Dockerfile - Basic Dependency Installation (Less Efficient)

# Start from a base Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the entire application code, including requirements.txt
COPY . .

# Install dependencies
# Problem: This runs *every time* any application file changes!
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the application (example)
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]`}</Pre>
        <p>
          While this works, it has a significant drawback related to Docker’s build cache. Docker builds images in layers. Each
          instruction in the <C>Dockerfile</C> (like <C>COPY</C>, <C>RUN</C>, <C>WORKDIR</C>) creates a new layer. If an
          instruction and its input files haven’t changed since the last build, Docker reuses the cached layer from the previous
          build, making the process much faster.
        </p>
        <p>
          In the basic approach above, the <C>COPY . .</C> command copies all your project files. If you change any file in your
          application (even a minor code adjustment in an API endpoint), the input to the <C>COPY . .</C> command changes. This
          invalidates the cache for this layer and all subsequent layers, including the <C>RUN pip install</C> layer.
          Consequently, Docker will reinstall all your Python dependencies every time you rebuild the image, even if{' '}
          <C>requirements.txt</C> itself hasn’t changed. For ML applications with potentially large libraries like TensorFlow,
          PyTorch, or scikit-learn, this can add considerable time to your development and deployment cycles.
        </p>
        <Hint>Press “Change one line in main.py”. COPY and the pip layer both leave the cache.</Hint>
      </div>
    ),
  },
  {
    id: 'fast-copy',
    title: 'Leveraging Build Cache for Efficiency',
    subtitle: 'Copy requirements.txt, install, then copy the rest of the app',
    Visual: FastCopyVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          To optimize this, you should structure your <C>Dockerfile</C> to take advantage of layer caching. The strategy is to
          copy and install dependencies before copying the rest of your application code. This way, the dependency installation
          layer is only rebuilt if the <C>requirements.txt</C> file itself changes.
        </p>
        <p>Here’s the improved structure:</p>
        <Pre>{`# Dockerfile - Optimized Dependency Installation

# Start from a base Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# 1. Copy only the requirements file first
COPY requirements.txt .

# 2. Install dependencies
# This layer is cached and only re-run if requirements.txt changes.
RUN pip install --no-cache-dir -r requirements.txt

# 3. Now copy the rest of the application code
COPY . .

# Command to run the application (example)
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]`}</Pre>
        <p>With this optimized approach:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li><C>COPY requirements.txt .</C>: This copies only the requirements file. Docker caches this layer.</li>
          <li>
            <C>RUN pip install --no-cache-dir -r requirements.txt</C>: This installs the dependencies based only on the{' '}
            <C>requirements.txt</C> file copied in the previous step. As long as <C>requirements.txt</C> doesn’t change between
            builds, Docker reuses the cached layer containing all the installed packages. The <C>--no-cache-dir</C> flag tells{' '}
            <C>pip</C> not to store downloaded packages in the cache, which helps keep the final image size smaller, although the
            installation itself might take slightly longer if packages need to be re-downloaded.
          </li>
          <li>
            <C>COPY . .</C>: This copies the rest of your application source code (your Python files, model artifacts if managed
            this way, etc.). If you only change your application code (e.g., update an endpoint function), only this layer and
            any subsequent layers are rebuilt. The potentially time-consuming dependency installation layer remains cached.
          </li>
        </ol>
        <p>
          This simple reordering drastically speeds up rebuilds during development when you frequently change your application
          code but not its dependencies.
        </p>
        <Hint>The same one-line edit. The pip layer stays cached. Only the last COPY rebuilds.</Hint>
      </div>
    ),
  },
  {
    id: 'pin',
    title: 'Pinning Dependencies',
    subtitle: 'fastapi==0.85.0 installs that release on every build',
    Visual: PinVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          For truly reproducible builds, ensure your <C>requirements.txt</C> file contains pinned versions of your dependencies.
          Instead of:
        </p>
        <Pre>{`# requirements.txt (Less specific)
fastapi
uvicorn
pydantic
scikit-learn
joblib`}</Pre>
        <p>Use specific versions obtained from your working development environment, typically using <C>pip freeze</C>:</p>
        <Pre>{`# requirements.txt (Pinned versions)
fastapi==0.85.0
uvicorn[standard]==0.18.3
pydantic==1.10.2
scikit-learn==1.1.2
joblib==1.1.0
# ... other dependencies with specific versions`}</Pre>
        <p>
          Pinning versions ensures that <C>pip install -r requirements.txt</C> always installs the exact same package versions
          inside the Docker container as you used during development and testing, preventing unexpected behavior caused by
          upstream package updates.
        </p>
        <Box title="Current versions">
          <p>
            Those version numbers are the lesson’s pins. A current project pins the versions you tested. The practice is the same:
            write the exact version in <C>requirements.txt</C>.
          </p>
        </Box>
        <Hint>Publish a newer FastAPI. The unpinned file moves. The pinned file stays on 0.85.0.</Hint>
      </div>
    ),
  },
  {
    id: 'venv',
    title: 'Virtual Environments and Docker',
    subtitle: 'The container is already the isolated environment',
    Visual: NoVenvVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          A common point of confusion is whether to use Python virtual environments (like <C>venv</C> or <C>conda</C>) inside a
          Docker container. Generally, this is unnecessary and adds extra steps. Docker containers provide their own isolated
          filesystem and process space. The container itself acts as the isolated environment for your application and its
          dependencies. Installing packages directly into the system Python site-packages directory within the container (as the{' '}
          <C>pip install</C> command does by default when run as root or in the base environment) is the standard practice and
          achieves the desired isolation.
        </p>
        <p>
          By carefully managing how and when dependencies are installed within your <C>Dockerfile</C>, leveraging Docker’s layer
          caching, and pinning dependency versions, you create smaller, more reliable, and faster-building Docker images for your
          FastAPI ML applications. This forms a solid foundation for consistent deployment across different environments.
        </p>
        <Hint>Compare a venv nested inside the container with pip installing straight into the container’s Python.</Hint>
      </div>
    ),
  },
  {
    id: 'env-why',
    title: 'Configuring Applications with Environment Variables',
    subtitle: 'One image, three launches, no rebuild',
    Visual: EnvLaunchVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Packaging a FastAPI application into a Docker container creates a self-contained unit. However, applications rarely
          operate identically in every environment. You might need different database connection strings for development versus
          production, varying API keys for external services, or perhaps just a different logging level for debugging. Hardcoding
          these configuration values directly into your application code is inflexible and poses security risks, especially for
          sensitive information.
        </p>
        <p>
          A standard and effective practice, particularly in containerized environments, is to manage configuration through{' '}
          <span className="font-semibold text-white">environment variables</span>. These variables exist outside your application
          code, within the operating system or container environment where your application runs. This approach decouples
          configuration from the application logic, making your Docker images more portable and adaptable.
        </p>
        <p className="font-semibold text-white">Why Use Environment Variables for Configuration?</p>
        <p>Using environment variables offers several significant advantages:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Flexibility Across Environments:</span> You can build a single Docker image
            and deploy it to different environments (development, staging, production) simply by setting different environment
            variables when launching the container. No code changes or image rebuilds are necessary just for configuration
            adjustments.
          </li>
          <li>
            <span className="font-semibold text-white">Improved Security:</span> Sensitive information like API keys, database
            passwords, or secret keys should never be hardcoded in your source code or baked directly into Docker images.
            Environment variables provide a mechanism to inject these secrets into the container at runtime, keeping them out of
            version control and image layers.
          </li>
          <li>
            <span className="font-semibold text-white">Adherence to Twelve-Factor App Principles:</span> Storing configuration in
            the environment is a core principle of the Twelve-Factor App methodology, a widely recognized set of best practices
            for building modern, scalable web applications.
          </li>
        </ol>
        <Hint>Dev, staging, and prod share one image. Only the values on the launch change.</Hint>
      </div>
    ),
  },
  {
    id: 'os-environ',
    title: 'Accessing Environment Variables in Python',
    subtitle: 'os.environ["NAME"] raises when the name is missing. .get returns a default',
    Visual: OsEnvironVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p className="font-semibold text-white">Accessing Environment Variables in Python</p>
        <p>
          Python’s standard library provides the <C>os</C> module to interact with the operating system, including accessing
          environment variables. The primary way to read them is using <C>os.environ</C>, which behaves like a dictionary.
        </p>
        <Pre>{`import os

# Accessing an environment variable
# Using os.environ['VAR_NAME'] will raise a KeyError if the variable is not set.
# api_key = os.environ['MY_API_KEY']

# A safer way: using .get() with an optional default value
api_key = os.environ.get('MY_API_KEY', 'default_key_if_not_set')
model_path = os.environ.get('MODEL_PATH', './models/default_model.joblib') # Example for ML model path
log_level = os.environ.get('LOG_LEVEL', 'INFO')

print(f"API Key: {api_key}")
print(f"Model Path: {model_path}")
print(f"Log Level: {log_level}")`}</Pre>
        <p>
          Using <C>os.environ.get('VAR_NAME', default_value)</C> or <C>os.getenv('VAR_NAME', default_value)</C> is generally
          preferred because it allows you to provide a default value if the environment variable isn’t set, preventing your
          application from crashing due to missing configuration.
        </p>
        <Hint>Step 1 is the KeyError. Step 2 is the default. Step 3 sets the variable so both reads agree.</Hint>
      </div>
    ),
  },
  {
    id: 'settings',
    title: 'Structured Configuration with Pydantic Settings',
    subtitle: 'APP_TITLE, LOG_LEVEL, MODEL_PATH, and API_KEY land on one object',
    Visual: SettingsFillVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          While <C>os.environ.get</C> works well for simple cases, managing numerous configuration variables can become
          cumbersome. FastAPI integrates with Pydantic, which offers a powerful way to manage application settings, including
          reading from environment variables automatically.
        </p>
        <p>
          Pydantic’s settings management (now often used via the <C>pydantic-settings</C> library) allows you to define a
          configuration schema using a Pydantic model. Pydantic will then attempt to load values for the fields in your model
          from environment variables, automatically performing type casting and validation.
        </p>
        <p>First, ensure you have <C>pydantic-settings</C> installed:</p>
        <Pre>{`pip install pydantic-settings`}</Pre>
        <p>Now, you can define a settings class:</p>
        <Pre>{`# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class AppSettings(BaseSettings):
    # Pydantic will automatically try to load these from environment variables
    # Example: APP_TITLE will be loaded from the environment variable APP_TITLE
    app_title: str = "ML Model API"
    log_level: str = "INFO"
    model_path: str = "./models/default_model.joblib"
    api_key: Optional[str] = None # Example for an optional secret

    # Configure Pydantic settings
    model_config = SettingsConfigDict(
        # Environment variables are typically uppercase, but Pydantic is case-insensitive by default
        case_sensitive=False,
        # You can optionally load from a .env file during development (requires python-dotenv)
        # env_file = '.env'
    )

# Create a single instance to be used throughout the application
settings = AppSettings()`}</Pre>
        <p>In this example:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><C>AppSettings</C> inherits from <C>pydantic_settings.BaseSettings</C>.</li>
          <li>
            Fields defined in the class (<C>app_title</C>, <C>log_level</C>, <C>model_path</C>, <C>api_key</C>) represent your
            application’s configuration settings.
          </li>
          <li>
            Pydantic attempts to find environment variables matching the field names (case-insensitively by default). For
            example, it looks for <C>APP_TITLE</C>, <C>LOG_LEVEL</C>, <C>MODEL_PATH</C>, and <C>API_KEY</C>.
          </li>
          <li>Default values are provided directly in the class definition.</li>
          <li>
            Type hints (e.g., <C>str</C>, <C>Optional[str]</C>) ensure that the loaded values are correctly parsed and validated.
            If an environment variable exists but cannot be cast to the specified type (e.g., providing “not-an-integer” for an{' '}
            <C>int</C> field), Pydantic will raise a validation error.
          </li>
        </ul>
        <Box title="Current versions">
          <p>
            The pinning example earlier uses Pydantic 1.10, where <C>BaseSettings</C> lived in <C>pydantic</C>. This settings
            class uses <C>pydantic_settings</C> and <C>SettingsConfigDict</C>, which is the current package.
          </p>
        </Box>
        <Hint>Step 1 shows the environment names. Step 2 fills the fields. Step 3 leaves API_KEY as None.</Hint>
      </div>
    ),
  },
  {
    id: 'depends',
    title: 'Using the Settings Object',
    subtitle: 'Depends(get_settings) hands the same object to the route',
    Visual: InfoEndpointVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          You can then import and use the <C>settings</C> instance wherever you need configuration values in your FastAPI
          application, often using dependency injection:
        </p>
        <Pre>{`# main.py (or your relevant router file)
from fastapi import FastAPI, Depends
from .config import AppSettings, settings # Import the instance

# Dependency function to get settings
def get_settings() -> AppSettings:
    return settings

app = FastAPI()

@app.get("/info")
async def info(current_settings: AppSettings = Depends(get_settings)):
    # Access settings through the dependency
    return {
        "app_title": current_settings.app_title,
        "log_level": current_settings.log_level,
        "model_path_configured": current_settings.model_path
    }

# You can also use the settings instance directly if not using Depends
print(f"Starting application: {settings.app_title}")
# ... rest of your application setup`}</Pre>
        <p>
          Using Pydantic <C>BaseSettings</C> provides a structured, validated, and type-safe way to handle configuration loaded
          from the environment.
        </p>
        <Hint>Four steps: the request, the dependency, the fields, then the JSON.</Hint>
      </div>
    ),
  },
  {
    id: 'env-source',
    title: 'Setting Environment Variables for Docker Containers',
    subtitle: 'ENV is the image default. -e overrides it, including over an env file',
    Visual: EnvSourceVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Now that your application knows how to read environment variables, how do you provide them to the Docker container?
          There are several common methods:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Using the ENV instruction in the Dockerfile:</span> You can set default
            environment variables directly within your <C>Dockerfile</C>. These values are baked into the image. This is suitable
            for non-sensitive defaults or variables unlikely to change often between environments.
          </li>
        </ol>
        <Pre>{`# Dockerfile excerpt
FROM python:3.9-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app/app
COPY ./models /app/models # Assuming models are copied in

# Set default environment variables
ENV LOG_LEVEL="INFO"
ENV MODEL_PATH="/app/models/iris_model.joblib"
ENV APP_TITLE="Default ML API Title"

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the application using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`}</Pre>
        <p>
          Variables set with <C>ENV</C> are available during the image build process and as defaults when a container starts from
          the image.
        </p>
        <ol className="list-decimal space-y-2 pl-5" start={2}>
          <li>
            <span className="font-semibold text-white">Using the docker run -e or --env flag:</span> You can override <C>ENV</C>{' '}
            defaults or provide additional environment variables when starting a container using the <C>-e</C> or <C>--env</C>{' '}
            flag. This is the most common way to provide environment-specific configuration or secrets at runtime.
          </li>
        </ol>
        <Pre>{`# Run the container, overriding LOG_LEVEL and setting a specific API_KEY
docker run -d -p 8000:8000 \\
  -e LOG_LEVEL="DEBUG" \\
  -e API_KEY="secret-prod-api-key-12345" \\
  -e APP_TITLE="Production ML Service" \\
  your-fastapi-image-name:latest`}</Pre>
        <p>
          Each <C>-e</C> flag sets one environment variable (<C>VAR_NAME=value</C>). This method keeps sensitive data out of the
          image itself.
        </p>
        <ol className="list-decimal space-y-2 pl-5" start={3}>
          <li>
            <span className="font-semibold text-white">Using an Environment File (--env-file):</span> For managing a larger number
            of variables, especially during development or with tools like Docker Compose, you can place them in a file (e.g.,{' '}
            <C>.env</C>) and pass the file path to the <C>docker run</C> command.
          </li>
        </ol>
        <Pre>{`# Example .env file (e.g., config.env)
LOG_LEVEL=DEBUG
API_KEY=local-dev-key-abcdef
MODEL_PATH=/app/models/dev_model.joblib
APP_TITLE=Development ML API`}</Pre>
        <Pre>{`# Run the container using the environment file
docker run -d -p 8000:8000 --env-file ./config.env your-fastapi-image-name:latest`}</Pre>
        <p>
          Docker reads each line in the file as a <C>KEY=VALUE</C> pair and sets the corresponding environment variable inside
          the container. Variables set via <C>-e</C> typically override those from an <C>--env-file</C>.
        </p>
        <Hint>Step 1 is the baked-in INFO. Step 2 overrides it with -e DEBUG. Step 3 keeps DEBUG even when the file says WARNING.</Hint>
      </div>
    ),
  },
  {
    id: 'secrets',
    title: 'Handling Sensitive Information',
    subtitle: 'A runtime variable stays out of the image and still shows up in inspect',
    Visual: InspectSecretVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          While environment variables are a significant improvement over hardcoding secrets, be aware that they might still be
          visible through container inspection tools or logs in some environments. For highly sensitive production secrets, use
          dedicated secret management systems (like HashiCorp Vault, AWS Secrets Manager, Google Secret Manager, Azure Key Vault).
          These systems provide more security features like access control, auditing, and secret rotation. Integrating these often
          involves fetching secrets at application startup or using sidecar containers, which is a more advanced deployment
          pattern outside the scope of this immediate section but important to know for production hardening. For many
          applications, however, environment variables
        </p>
        <Hint>The image layers stay empty. docker inspect reveals the key that was passed to this container.</Hint>
      </div>
    ),
  },
];

export default function ContainerizationAndDeploymentPreparationPartTwo() {
  return <ChapterDeck meta={meta} slides={slidesData} />;
}
