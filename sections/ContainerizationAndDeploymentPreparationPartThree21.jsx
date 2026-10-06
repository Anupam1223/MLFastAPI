import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  ProjectTreeVisualizer,
  DockerfileRecipeVisualizer,
  BuildImageVisualizer,
  RunFlagsVisualizer,
  VerifyApiVisualizer,
  GunicornWorkersVisualizer,
  GunicornCommandVisualizer,
  EnvWorkersVisualizer,
} from '../components/DockerPrepPartThreeVisualizers';

export const meta = {
  title: 'Containerization and Deployment Preparation (Part 3)',
  subtitle: 'containerize the ML API, then put Gunicorn in front of the workers',
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
    id: 'tree',
    title: 'Hands-on Practical: Containerizing the ML API',
    subtitle: 'app code, the model file, the Dockerfile, and requirements.txt',
    Visual: ProjectTreeVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          This hands-on exercise packages a machine learning API by applying Docker and containerization principles. It assumes
          you have a functional FastAPI application, including your trained model artifact (e.g., a <C>.joblib</C> or <C>.pkl</C>{' '}
          file), and that you have Docker installed and running on your system.
        </p>
        <p className="font-semibold text-white">Project Structure Overview</p>
        <p>Before creating the <C>Dockerfile</C>, let’s review a typical project layout. Your structure might resemble this:</p>
        <Pre>{`my_ml_api/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app instance, imports routers
│   ├── api/
│   │   ├── __init__.py
│   │   └── predict.py   # Contains the /predict endpoint
│   ├── models/
│   │   ├── __init__.py  # Pydantic models for request/response
│   ├── core/
│   │   ├── __init__.py
│   │   └── inference.py # Model loading and inference logic
├── models/
│   └── sentiment_model.joblib # Example model file
├── tests/
│   └── ...
├── Dockerfile           # We will create this file
└── requirements.txt     # Python dependencies`}</Pre>
        <p className="text-xs italic text-gray-400">
          Project structure showing application code (<C>app/</C>), model artifacts (<C>models/</C>), tests (<C>tests/</C>), and
          configuration files (<C>Dockerfile</C>, <C>requirements.txt</C>).
        </p>
        <p>
          Ensure your ML model file (e.g., <C>sentiment_model.joblib</C>) is present in the <C>models/</C> directory at the root
          level, and your <C>requirements.txt</C> accurately lists all necessary packages (like <C>fastapi</C>, <C>uvicorn</C>,{' '}
          <C>scikit-learn</C>, <C>joblib</C>, <C>pydantic</C>).
        </p>
        <Hint>Step through the root, main.py, the predict route, inference, the model file, then the Dockerfile and requirements.</Hint>
      </div>
    ),
  },
  {
    id: 'dockerfile',
    title: 'Creating the Dockerfile',
    subtitle: 'Requirements and pip first, then the app and the model',
    Visual: DockerfileRecipeVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Navigate to the root directory of your project (<C>my_ml_api/</C>) in your terminal. Create a new file named{' '}
          <C>Dockerfile</C> (with no extension) and open it in your text editor.
        </p>
        <p>Add the following content to your <C>Dockerfile</C>, step by step:</p>
        <Pre>{`# 1. Base Image: Use an official Python runtime as a parent image
# We use a specific version for reproducibility and the 'slim' variant for smaller size.
FROM python:3.9-slim

# 2. Set Working Directory: Define the working directory inside the container
WORKDIR /app

# 3. Copy Dependencies File: Copy the requirements file first to leverage Docker cache
COPY requirements.txt requirements.txt

# 4. Install Dependencies: Install Python dependencies specified in requirements.txt
# --no-cache-dir reduces image size, --upgrade pip ensures we have the latest pip
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

# 5. Copy Application Code and Model: Copy the rest of the application code and the ML model
COPY ./app /app/app
COPY ./models /app/models

# 6. Expose Port: Inform Docker that the container listens on port 8000 at runtime
EXPOSE 8000

# 7. Command to Run: Specify the command to run the application using Uvicorn
# We use 0.0.0.0 to make the server accessible from outside the container.
# The port 8000 matches the EXPOSE instruction.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`}</Pre>
        <p>Let’s break down these instructions:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <C>FROM python:3.9-slim</C>: Specifies the base image. Using a specific version tag (<C>3.9-slim</C>) ensures
            consistency and the <C>slim</C> variant helps keep the image size down.
          </li>
          <li><C>WORKDIR /app</C>: Sets the default directory for subsequent commands within the container.</li>
          <li>
            <C>COPY requirements.txt requirements.txt</C>: Copies only the requirements file first. Docker caches layers; if{' '}
            <C>requirements.txt</C> doesn’t change, the <C>RUN pip install</C> layer can be reused from the cache during
            subsequent builds, speeding things up.
          </li>
          <li>
            <C>RUN pip install ...</C>: Executes the installation of dependencies. Using <C>&amp;&amp; \</C> chains commands, and{' '}
            <C>--no-cache-dir</C> prevents pip from storing cache, reducing the final image size.
          </li>
          <li>
            <C>COPY ./app /app/app</C> and <C>COPY ./models /app/models</C>: Copies your application source code (<C>app</C>{' '}
            directory) and the machine learning models (<C>models</C> directory) into the specified locations within the
            container’s working directory (<C>/app</C>).
          </li>
          <li>
            <C>EXPOSE 8000</C>: Documents that the application inside the container will listen on port 8000. This doesn’t
            actually publish the port; it’s more for information and can be used by automated systems.
          </li>
          <li>
            <C>CMD ["uvicorn", ...]</C>: Defines the default command to execute when a container starts from this image. It
            starts the Uvicorn server, telling it to run the FastAPI application instance (<C>app</C>) found in <C>app/main.py</C>,
            listen on all available network interfaces (<C>0.0.0.0</C>), and use port 8000.
          </li>
        </ul>
        <Box title="Current versions">
          <p>The lesson pins <C>python:3.9-slim</C>. A newer slim tag uses the same instructions. Change the <C>FROM</C> line when you want a different Python.</p>
        </Box>
        <Hint>Seven layers. Step 4 is the cached pip install. Step 7 is uvicorn on 0.0.0.0.</Hint>
      </div>
    ),
  },
  {
    id: 'build',
    title: 'Building the Docker Image',
    subtitle: 'docker build -t my-ml-api:latest .',
    Visual: BuildImageVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          With the <C>Dockerfile</C> created in your project’s root directory, you can now build the Docker image. Open your
          terminal, navigate to the project root (<C>my_ml_api/</C>), and run the following command:
        </p>
        <Pre>{`docker build -t my-ml-api:latest .`}</Pre>
        <p>Let’s dissect this command:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><C>docker build</C>: The command to build an image from a <C>Dockerfile</C>.</li>
          <li>
            <C>-t my-ml-api:latest</C>: The <C>-t</C> flag tags the image. We’re naming it <C>my-ml-api</C> and giving it the tag{' '}
            <C>latest</C>. You can use other tags like version numbers (e.g., <C>my-ml-api:0.1.0</C>). Tagging makes it easier to
            manage and reference images.
          </li>
          <li>
            <C>.</C>: This indicates the build context, which is the current directory. Docker sends the files and folders in
            this directory (respecting <C>.dockerignore</C> if present) to the Docker daemon to use during the build process.
          </li>
        </ul>
        <p>
          You will see Docker executing each step defined in your <C>Dockerfile</C>. This might take a few minutes the first time,
          especially during the dependency installation step. Subsequent builds will be faster if dependencies haven’t changed,
          thanks to Docker’s layer caching.
        </p>
        <p>Once completed, you can verify the image was created by listing your local Docker images:</p>
        <Pre>{`docker images`}</Pre>
        <p>You should see <C>my-ml-api</C> with the tag <C>latest</C> in the list.</p>
        <Hint>Four steps: the command, the tag and the dot, the pip layer, then the name in docker images.</Hint>
      </div>
    ),
  },
  {
    id: 'run',
    title: 'Running the Docker Container',
    subtitle: 'Detach, publish 8000, and name it ml-api-container',
    Visual: RunFlagsVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>Now that you have the image, you can run it as a container:</p>
        <Pre>{`docker run -d -p 8000:8000 --name ml-api-container my-ml-api:latest`}</Pre>
        <p>Explanation of the flags:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><C>docker run</C>: The command to create and start a container from an image.</li>
          <li><C>-d</C>: Runs the container in detached mode (in the background) and prints the container ID.</li>
          <li>
            <C>-p 8000:8000</C>: Publishes the container’s port to the host. It maps port 8000 on your host machine to port 8000
            inside the container (where Uvicorn is listening, as specified by <C>EXPOSE</C> and <C>CMD</C>). The format is{' '}
            <C>host_port:container_port</C>.
          </li>
          <li>
            <C>--name ml-api-container</C>: Assigns a recognizable name to the running container, making it easier to manage
            (e.g., check logs, stop).
          </li>
          <li><C>my-ml-api:latest</C>: Specifies the image to run.</li>
        </ul>
        <Hint>The container stays stopped until you step. -d, then the port, then the name.</Hint>
      </div>
    ),
  },
  {
    id: 'verify',
    title: 'Verifying the Running Container',
    subtitle: 'ps, a POST to /predict, logs, stop, then rm',
    Visual: VerifyApiVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>You can check if your container is running using:</p>
        <Pre>{`docker ps`}</Pre>
        <p>
          This command lists all running containers. You should see <C>ml-api-container</C> listed, showing it’s up and running,
          and displaying the port mapping <C>0.0.0.0:8000-&gt;8000/tcp</C>.
        </p>
        <p>
          Now, test your API. Open your web browser or use a tool like <C>curl</C> to send a request to your prediction endpoint,
          which is now accessible via your host machine’s port 8000:
        </p>
        <Pre>{`# Example using curl, assuming your endpoint is /predict
# and accepts JSON input like {"text": "some input"}
curl -X POST "http://localhost:8000/predict" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "FastAPI is great for ML models!"}'`}</Pre>
        <p>
          Replace the URL path (<C>/predict</C>) and the data (<C>-d '…'</C>) with the specifics of your API endpoint and expected
          input format. You should receive the prediction response from your model, served by the FastAPI application running
          inside the Docker container.
        </p>
        <p>
          To view the logs generated by the application inside the container (useful for debugging), use the <C>docker logs</C>{' '}
          command followed by the container name:
        </p>
        <Pre>{`docker logs ml-api-container`}</Pre>
        <p>To stop the container:</p>
        <Pre>{`docker stop ml-api-container`}</Pre>
        <p>To remove the container (after stopping):</p>
        <Pre>{`docker rm ml-api-container`}</Pre>
        <p>
          You have successfully containerized your FastAPI machine learning application! You now have a self-contained Docker
          image that includes your application code, dependencies, and ML model. This image can be run consistently across
          different environments, forming the foundation for reliable deployment.
        </p>
        <Hint>docker ps, then curl. Stop before rm. rm while it is running tells you to stop first.</Hint>
      </div>
    ),
  },
  {
    id: 'gunicorn',
    title: 'Preparing for Production Deployment (Gunicorn/Uvicorn)',
    subtitle: 'One Uvicorn process exits, and the API goes with it',
    Visual: GunicornWorkersVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          While the <C>uvicorn</C> development server with <C>--reload</C> is excellent for building and iterating on your FastAPI
          application, it’s not designed for the demands of a production environment. Production requires stability, the ability
          to handle multiple concurrent requests efficiently, and resilience against failures. This is where production-grade ASGI
          servers and process managers come into play.
        </p>
        <p>
          You’ve already been using Uvicorn, a lightning-fast ASGI (Asynchronous Server Gateway Interface) server, which is the
          foundation for running FastAPI applications. However, running Uvicorn directly using the simple command{' '}
          <C>uvicorn main:app</C> in production lacks process management features. If the single Uvicorn process crashes, your
          application goes offline. It also doesn’t inherently manage multiple worker processes to handle multi-core processors
          effectively for concurrent requests.
        </p>
        <p>
          To address these needs, we typically introduce a process manager. A very popular and battle-tested choice in the Python
          ecosystem is Gunicorn (Green Unicorn). Although Gunicorn itself is primarily a WSGI server, it can act as a process
          manager for ASGI applications by using specialized Uvicorn worker classes.
        </p>
        <p className="font-semibold text-white">Using Gunicorn with Uvicorn Workers</p>
        <p>
          The standard approach for deploying FastAPI applications in production involves using Gunicorn to manage Uvicorn worker
          processes. Gunicorn handles tasks like:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Starting multiple worker processes (instances of your application).</li>
          <li>Monitoring the health of worker processes and restarting them if they crash.</li>
          <li>Distributing incoming requests among the available workers.</li>
          <li>Handling server signals gracefully (e.g., for zero-downtime restarts).</li>
        </ul>
        <p>
          In this setup, Gunicorn listens for incoming HTTP requests and forwards them to one of its managed Uvicorn workers. The
          Uvicorn worker then uses its high-performance ASGI capabilities to process the request via your FastAPI application.
        </p>
        <p className="text-xs italic text-gray-400">
          Gunicorn master process managing multiple Uvicorn workers, each running an instance of the FastAPI application.
        </p>
        <p>To use this setup, first ensure Gunicorn is installed in your environment (or added to your <C>requirements.txt</C>):</p>
        <Pre>{`pip install gunicorn`}</Pre>
        <Hint>Steps 1 and 2 are a single Uvicorn process, then a crash. From step 3 the master hands work to workers, and step 5 replaces the one that exited.</Hint>
      </div>
    ),
  },
  {
    id: 'command',
    title: 'The Gunicorn Command',
    subtitle: 'Workers, the Uvicorn worker class, and a bind address of 0.0.0.0',
    Visual: GunicornCommandVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>Then, you can run your application using a command like this:</p>
        <Pre>{`gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:8000`}</Pre>
        <p>Let’s break down this command:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><C>gunicorn</C>: The command to start the Gunicorn server.</li>
          <li>
            <C>-w 4</C>: This specifies the number of worker processes to start. <C>4</C> is just an example. A common starting
            point is <C>(2 * number_of_cpu_cores) + 1</C>. However, the optimal number depends heavily on your application’s
            workload (CPU-bound vs. I/O-bound) and the nature of your ML model inference. You will need to experiment and monitor
            performance to find the best value. For CPU-intensive inference tasks, having more workers than CPU cores might lead
            to diminishing returns due to context switching.
          </li>
          <li>
            <C>-k uvicorn.workers.UvicornWorker</C>: This is important. It tells Gunicorn to use Uvicorn’s worker class, allowing
            Gunicorn (a WSGI server) to manage and communicate with Uvicorn (an ASGI server) workers.
          </li>
          <li>
            <C>main:app</C>: This is the same format used with Uvicorn, specifying the Python module (<C>main</C>) and the FastAPI
            application instance (<C>app</C>) within that module. Adjust this based on your project structure.
          </li>
          <li>
            <C>-b 0.0.0.0:8000</C>: This binds the Gunicorn server to listen on all available network interfaces (<C>0.0.0.0</C>)
            on port <C>8000</C>. Binding to <C>0.0.0.0</C> is necessary for the application inside a Docker container to be
            accessible from outside the container. The port <C>8000</C> is typical but can be changed.
          </li>
        </ul>
        <p className="font-semibold text-white">Integrating with Your Dockerfile</p>
        <p>
          Now that you know how to run the application using Gunicorn, you need to modify your <C>Dockerfile</C> to use this
          command when the container starts. Instead of using the development <C>uvicorn</C> command, you’ll replace the <C>CMD</C>{' '}
          instruction:
        </p>
        <Pre>{`# (Assuming previous Dockerfile steps: base image, copy code, install dependencies)
# ...

# Expose the port Gunicorn will listen on
EXPOSE 8000

# Set default command to run Gunicorn with Uvicorn workers
# Use environment variables for flexibility (see below)
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "-b", "0.0.0.0:8000"]`}</Pre>
        <Box title="Module path">
          <p>
            The hands-on Dockerfile starts <C>app.main:app</C>, because <C>main.py</C> lives in <C>app/</C>. This command writes{' '}
            <C>main:app</C> and says to adjust it for the project layout.
          </p>
        </Box>
        <Hint>-w 2, 4, or 8 against two cores. The bind button switches 0.0.0.0 and 127.0.0.1.</Hint>
      </div>
    ),
  },
  {
    id: 'env',
    title: 'Using Environment Variables for Configuration',
    subtitle: 'WORKERS and PORT change at docker run, and the image stays the same',
    Visual: EnvWorkersVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Hardcoding values like the number of workers or the port directly in the <C>Dockerfile</C>’s <C>CMD</C> isn’t always
          ideal. Different deployment environments (staging, production) might require different settings. As discussed in the
          previous section, environment variables are the standard way to handle this.
        </p>
        <p>
          You can modify the <C>CMD</C> to read values from environment variables. Gunicorn allows setting many options via
          environment variables or a configuration file. For instance, you could set the number of workers and the port via
          environment variables when running the container:
        </p>
        <Pre>{`# (Assuming previous Dockerfile steps)
# ...

# Expose default port (can be overridden)
EXPOSE 8000

# Define default values using environment variables
ENV PORT=8000
ENV WORKERS=4
ENV APP_MODULE="main:app"

# Use environment variables in the command
# Note: Shell form of CMD is often needed to properly expand variables
CMD gunicorn -w \${WORKERS} -k uvicorn.workers.UvicornWorker \${APP_MODULE} -b 0.0.0.0:\${PORT}`}</Pre>
        <p>Now, when you run your Docker container, you can override these defaults:</p>
        <Pre>{`# Run with default 4 workers on port 8000
docker run -p 8000:8000 your-ml-api-image

# Run with 8 workers on port 9000
docker run -p 9000:9000 -e WORKERS=8 -e PORT=9000 your-ml-api-image`}</Pre>
        <p>
          This approach provides much greater flexibility for configuring your application server in various deployment scenarios
          without rebuilding the Docker image.
        </p>
        <p>
          By combining Gunicorn for process management and Uvicorn workers for high-performance ASGI request handling, you create
          a setup that is significantly more resilient, scalable, and suitable for serving your machine learning models in
          production than the basic development server. This containerized, production-ready server setup is the final piece
          before potentially deploying your application to cloud platforms or internal infrastructure.
        </p>
        <Hint>Step 2 keeps 4 workers because the exec form does not expand WORKERS. Step 3 is the shell form, so -e WORKERS=8 and -e PORT=9000 take effect.</Hint>
      </div>
    ),
  },
];

export default function ContainerizationAndDeploymentPreparationPartThree() {
  return <ChapterDeck meta={meta} slides={slidesData} />;
}
