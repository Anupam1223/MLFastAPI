import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  DriftVisualizer,
  VMvsContainerVisualizer,
  NamespacesVisualizer,
  CgroupsVisualizer,
  ImageVsContainerVisualizer,
  UnionFSVisualizer,
  DockerfileConveyorVisualizer,
  LayerCacheVisualizer,
  BestPracticesVisualizer,
  DockerignoreVisualizer,
  DownloadModelVisualizer,
  VolumeModelVisualizer,
} from '../components/DockerPrepVisualizers';

export const meta = {
  title: 'Containerization and Deployment Preparation (Part 1)',
  subtitle: 'package the FastAPI service, the Dockerfile, and the model',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;
const Pre = CodeBlock;

const Box = ({ title, tone = 'amber', children }) => (
  <div className={`space-y-1.5 rounded-lg border border-gray-700 border-l-4 bg-gray-800/30 p-3 ${tone === 'amber' ? 'border-l-amber-400' : 'border-l-teal-400'}`}>
    {title && <p className="font-semibold text-white">{title}</p>}
    {children}
  </div>
);

const Hint = ({ children }) => <p className="text-xs text-gray-400">{children}</p>;

const slidesData = [
  {
    id: 'drift',
    title: 'Introduction to Docker for Application Packaging',
    subtitle: 'The same service leaves a laptop and meets a different machine',
    Visual: DriftVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Deploying a FastAPI application that serves machine learning predictions from a development machine to a staging or
          production server introduces significant challenges. Ensuring the specific version of Python, all necessary libraries
          (like FastAPI, Uvicorn, scikit-learn, Pydantic), system dependencies, and even the trained model file itself are
          identically configured on the target machine is complex. Differences in operating systems, installed packages, or
          configurations can lead to unexpected errors and failures, famously summarized as the “it works on my machine” problem.
        </p>
        <p>
          This is where containerization, specifically using Docker, becomes extremely valuable. Docker provides a way to package
          your application, along with all its dependencies, into a standardized unit called a container. Think of a container as
          a lightweight, isolated box that contains everything your application needs to run: code, runtime (like Python), system
          tools, system libraries, settings, and in our case, the serialized machine learning model.
        </p>
        <Hint>Choose raw code or the capsule, then use Prev step and Next step. The path stays on Dev, Ship, or Prod until you move it.</Hint>
      </div>
    ),
  },
  {
    id: 'vm',
    title: 'Containers Share the Host Kernel',
    subtitle: 'A virtual machine carries a guest OS. A container does not',
    Visual: VMvsContainerVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Unlike traditional virtual machines (VMs) which virtualize an entire operating system, containers virtualize the
          operating system kernel. This means containers share the host system’s kernel but have their own isolated process
          space, filesystem, and network interfaces. This makes them much more lightweight and faster to start than VMs.
        </p>
        <p className="text-xs italic text-gray-400">
          Containers share the host OS kernel, making them more lightweight than VMs, which require a full guest OS each.
        </p>
        <p>For deploying FastAPI applications serving ML models, Docker offers several advantages:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Environment Consistency:</span> A Docker container runs identically
            regardless of where it’s deployed, whether it’s your laptop, a teammate’s machine, a testing server, or a cloud
            platform. This eliminates environment-related bugs.
          </li>
          <li>
            <span className="font-semibold text-white">Dependency Bundling:</span> Docker packages your FastAPI code, the correct
            Python version, all <C>pip</C> installed libraries (specified in <C>requirements.txt</C>), any system-level
            dependencies, and your trained model artifacts (like <C>.pkl</C> or <C>.joblib</C> files) into a single,
            self-contained unit.
          </li>
          <li>
            <span className="font-semibold text-white">Simplified Deployment:</span> Instead of complex setup scripts, deployment
            often becomes as simple as pulling the Docker image and running it. This streamlines the process of getting your ML
            model into production.
          </li>
          <li>
            <span className="font-semibold text-white">Isolation:</span> Your FastAPI application runs in its own isolated
            environment, preventing conflicts with other applications or libraries potentially running on the same host machine.
          </li>
        </ul>
        <Hint>Use + and − to add virtual machines and containers. The RAM meters and the boot times update with the counts.</Hint>
      </div>
    ),
  },
  {
    id: 'namespaces',
    title: 'Isolated Process Space, Filesystem, and Network',
    subtitle: 'The container shares the kernel and still cannot see the rest of the host',
    Visual: NamespacesVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Containers share the host system’s kernel but have their own isolated process space, filesystem, and network
          interfaces. This makes them much more lightweight and faster to start than VMs.
        </p>
        <p>
          <span className="font-semibold text-white">Isolation:</span> Your FastAPI application runs in its own isolated
          environment, preventing conflicts with other applications or libraries potentially running on the same host machine.
        </p>
        <Hint>Switch between host reality and Container A’s blinders, then choose PID, NET, or MNT.</Hint>
      </div>
    ),
  },
  {
    id: 'cgroups',
    title: 'Isolation on a Shared Host',
    subtitle: 'One application’s load stays inside its own environment',
    Visual: CgroupsVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          <span className="font-semibold text-white">Isolation:</span> Your FastAPI application runs in its own isolated
          environment, preventing conflicts with other applications or libraries potentially running on the same host machine.
        </p>
        <Hint>Turn the 512 MB ceiling on or off, then start the memory leak in container A and watch container B.</Hint>
      </div>
    ),
  },
  {
    id: 'pieces',
    title: 'Dockerfile, Image, and Container',
    subtitle: 'A recipe, a read-only template, then a running process',
    Visual: ImageVsContainerVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>The process generally involves three main components:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Dockerfile:</span> A text file containing instructions on how to build a
            Docker image. It specifies the base operating system, commands to install dependencies, copy application code and
            model files, and the command to run when the container starts. You’ll learn to write one tailored for FastAPI in the
            next section.
          </li>
          <li>
            <span className="font-semibold text-white">Docker Image:</span> A read-only template built from the Dockerfile. It
            contains the application and all its dependencies. Images are stored and can be shared via registries like Docker Hub.
          </li>
          <li>
            <span className="font-semibold text-white">Docker Container:</span> A runnable instance of a Docker image. You can
            start, stop, and manage containers. Each container runs as an isolated process based on the image definition.
          </li>
        </ol>
        <p>
          By using Docker, you encapsulate your entire ML prediction service, making it portable, reproducible, and significantly
          easier to manage across different stages of the development and deployment lifecycle. The following sections will guide
          you through creating a <C>Dockerfile</C> for your application, building an image, and running it as a container.
        </p>
        <Hint>Stamp another container from the same image. Write a file into one of them, then reset it. The image row stays locked.</Hint>
      </div>
    ),
  },
  {
    id: 'layers',
    title: 'A Read-Only Image, a Writable Container',
    subtitle: 'The template does not change when a container writes a file',
    Visual: UnionFSVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          <span className="font-semibold text-white">Docker Image:</span> A read-only template built from the Dockerfile. It
          contains the application and all its dependencies. Images are stored and can be shared via registries like Docker Hub.
        </p>
        <p>
          <span className="font-semibold text-white">Docker Container:</span> A runnable instance of a Docker image. You can
          start, stop, and manage containers. Each container runs as an isolated process based on the image definition.
        </p>
        <Hint>Switch between the layer stack and the merged folder, then edit config.json. The lower layer stays as it was.</Hint>
      </div>
    ),
  },
  {
    id: 'instructions',
    title: 'Writing a Dockerfile for a FastAPI Application',
    subtitle: 'FROM, WORKDIR, COPY, RUN, EXPOSE, and one CMD',
    Visual: DockerfileConveyorVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Containerization creates consistent environments for applications. The core component in this process that defines how
          an application is packaged is the <C>Dockerfile</C>. Think of a <C>Dockerfile</C> as a recipe or a set of instructions
          that Docker follows to build an image containing your FastAPI application, its dependencies, necessary data files (like
          your ML model), and the information needed to run it.
        </p>
        <p>
          A <C>Dockerfile</C> is simply a text file named <C>Dockerfile</C> (with no extension) placed in the root directory of
          your project. Inside this file, you write a series of commands, one per line, that specify the steps for assembling the
          image.
        </p>
        <p className="font-semibold text-white">Essential Dockerfile Instructions</p>
        <p>While there are many possible instructions you can use in a <C>Dockerfile</C>, a typical setup for a FastAPI application usually involves a few common ones:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <C>FROM</C>: Specifies the base image to build upon. Every <C>Dockerfile</C> must start with a <C>FROM</C> instruction.
            For Python applications, you’ll typically use an official Python image (e.g., <C>python:3.9</C>). This provides a
            starting Linux environment with Python and pip pre-installed.
          </li>
          <li>
            <C>WORKDIR</C>: Sets the working directory for subsequent instructions like <C>RUN</C>, <C>CMD</C>, <C>COPY</C>, and{' '}
            <C>ADD</C>. If the directory doesn’t exist, <C>WORKDIR</C> will create it. It helps organize your container’s filesystem.
          </li>
          <li>
            <C>COPY</C>: Copies files or directories from your local machine (the build context) into the filesystem of the
            container image. You’ll use this to get your application code, <C>requirements.txt</C> file, and ML model artifacts
            into the image.
          </li>
          <li>
            <C>RUN</C>: Executes commands in a new layer on top of the current image. This is commonly used to install Python
            dependencies using <C>pip install</C>. Each <C>RUN</C> instruction creates a new image layer, which has implications
            for caching and image size.
          </li>
          <li>
            <C>EXPOSE</C>: Informs Docker that the container listens on the specified network ports at runtime. This doesn’t
            actually publish the port; it functions as documentation between the person who builds the image and the person who
            runs the container. For FastAPI applications run with Uvicorn’s default settings, this is typically port 8000.
          </li>
          <li>
            <C>CMD</C>: Provides the default command to execute when a container starts from the image. There can only be one{' '}
            <C>CMD</C> instruction in a <C>Dockerfile</C>. If you specify an executable, it should be the first parameter. For
            running FastAPI, this command usually starts the Uvicorn server.
          </li>
        </ul>
        <Hint>Click a line, or use Prev step and Next step. RUN is a build layer. CMD is the command saved for when the container starts.</Hint>
      </div>
    ),
  },
  {
    id: 'example',
    title: 'Example Dockerfile for a FastAPI ML Application',
    subtitle: 'Requirements first, then the app, then uvicorn on 0.0.0.0',
    Visual: DockerfileConveyorVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Let’s put these instructions together into a practical <C>Dockerfile</C> for the ML prediction service we’ve been
          building. Assume your project structure looks something like this:
        </p>
        <Pre>{`.
├── app/
│   ├── main.py
│   ├── models/
│   │   └── your_model.joblib
│   └── ... (other python files)
├── requirements.txt
└── Dockerfile`}</Pre>
        <p>Here’s a sample <C>Dockerfile</C>:</p>
        <Pre>{`# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
# Use --compile to byte-compile python files for faster startup (optional)
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir --compile -r requirements.txt

# Copy the application code and model files into the container at /app
COPY ./app /app/app
COPY ./app/models /app/app/models

# Make port 8000 available outside this container
EXPOSE 8000

# Define environment variable (optional, can be set at runtime too)
ENV MODEL_PATH=/app/models/your_model.joblib

# Run main.py when the container launches using Uvicorn
# Listen on 0.0.0.0 to be accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`}</Pre>
        <Box title="Current versions" tone="amber">
          <p>The lesson pins <C>python:3.9-slim</C>. A current slim tag uses the same instructions. Change only the <C>FROM</C> line when you want a newer Python.</p>
        </Box>
        <Hint>The picture steps through the same kind of recipe: base, working directory, manifest, install, source, then the start command.</Hint>
      </div>
    ),
  },
  {
    id: 'understand',
    title: 'Understanding the Example',
    subtitle: 'Install dependencies before the code that changes often',
    Visual: LayerCacheVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>Let’s break down the example <C>Dockerfile</C> step-by-step:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <C>FROM python:3.9-slim</C>: We start with a slim version of the official Python 3.9 image. Using <C>slim</C> variants
            often results in smaller image sizes compared to the full image, as they include only the minimal packages needed to
            run Python.
          </li>
          <li>
            <C>WORKDIR /app</C>: We set the default directory inside the container to <C>/app</C>. All subsequent commands will
            run relative to this path.
          </li>
          <li>
            <C>COPY requirements.txt .</C>: We copy only the <C>requirements.txt</C> file from our project directory into the{' '}
            <C>/app</C> directory inside the container. Note the <C>.</C> indicating the destination directory (<C>/app</C> because
            of <C>WORKDIR</C>).
          </li>
          <li>
            <C>RUN pip install ...</C>: This is a critical step. We first upgrade <C>pip</C> itself and then install all the
            libraries listed in <C>requirements.txt</C>.
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li><C>--no-cache-dir</C>: This flag tells pip not to store the download cache, which helps keep the image layer smaller.</li>
              <li><C>--compile</C>: This pre-compiles Python source files to bytecode (<C>.pyc</C>), which can slightly speed up application startup.</li>
              <li>
                We copy <C>requirements.txt</C> and run <C>pip install</C> before copying the rest of the application code. This
                uses Docker’s build cache. If <C>requirements.txt</C> hasn’t changed, Docker can reuse the layer created by this{' '}
                <C>RUN</C> instruction, speeding up subsequent builds even if your application code changes.
              </li>
            </ul>
          </li>
          <li>
            <C>COPY ./app /app/app</C>: We copy the contents of our local <C>app</C> directory (containing <C>main.py</C>, etc.)
            into a subdirectory named <C>app</C> inside the container’s <C>/app</C> directory. The destination path becomes{' '}
            <C>/app/app</C>.
          </li>
          <li>
            <C>COPY ./app/models /app/app/models</C>: Similarly, we copy the ML model artifacts from the local <C>app/models</C>{' '}
            directory into <C>/app/app/models</C> within the container. You might adjust this depending on where your models are
            stored relative to your <C>Dockerfile</C>.
          </li>
          <li><C>EXPOSE 8000</C>: We document that the application inside the container will listen on port 8000.</li>
          <li>
            <C>ENV MODEL_PATH=...</C>: This sets an environment variable inside the container. Your FastAPI application can then
            read this environment variable to know where to load the model file from, making the path configurable.
          </li>
          <li>
            <C>CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]</C>: This defines the command that will run
            when a container is started from this image. It executes the <C>uvicorn</C> server, telling it to run the <C>app</C>{' '}
            object found in the <C>app/main.py</C> module.
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <C>--host 0.0.0.0</C>: This is important. It makes Uvicorn listen on all available network interfaces inside the
                container, allowing connections from outside the container (when the port is published). Using the default{' '}
                <C>127.0.0.1</C> would only allow connections from within the container itself.
              </li>
              <li><C>--port 8000</C>: Matches the port specified in the <C>EXPOSE</C> instruction.</li>
            </ul>
          </li>
        </ol>
        <Hint>Press “Edit one line and rebuild.” Copying the whole project first rebuilds the install. Copying the manifest first keeps that install cached.</Hint>
      </div>
    ),
  },
  {
    id: 'ignore',
    title: 'The .dockerignore File',
    subtitle: 'venv, bytecode, and .git stay out of the build context',
    Visual: DockerignoreVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Similar to <C>.gitignore</C>, you can create a <C>.dockerignore</C> file in the same directory as your <C>Dockerfile</C>.
          This file lists patterns of files and directories that should be excluded from the build context sent to the Docker
          daemon. This prevents unnecessarily large build contexts and avoids copying sensitive information or irrelevant files
          (like virtual environments, <C>.pyc</C> files, build artifacts, <C>.git</C> directories) into your image.
        </p>
        <p>A typical <C>.dockerignore</C> might look like:</p>
        <Pre>{`__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.git/
.pytest_cache/`}</Pre>
        <p>
          By defining this <C>Dockerfile</C>, you provide a clear, repeatable set of instructions for packaging your FastAPI ML
          application. The next step is to use this file to build the Docker image and run it as a container.
        </p>
        <Hint>Turn .dockerignore on and off. venv, .git, and __pycache__ stay in the folder when it is on.</Hint>
      </div>
    ),
  },
  {
    id: 'copy-model',
    title: 'Strategy 1: Copying Local Model Files Directly',
    subtitle: 'The image contains this exact .joblib, so a new model means a new build',
    Visual: ImageVsContainerVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p>
          Including a machine learning model as part of a Docker container image is primary for a FastAPI application’s
          deployment. For an API to function independently, it needs access to the trained model artifacts (like serialized model
          files, weights, or configuration files) within the container’s filesystem. Here are common strategies for achieving this.
        </p>
        <p className="font-semibold text-white">Strategy 1: Copying Local Model Files Directly</p>
        <p>
          The most straightforward method, especially during development or for simpler projects, is to include the model file
          directly within your project structure and copy it into the image during the build process.
        </p>
        <p>Imagine your project layout looks something like this:</p>
        <Pre>{`.
├── app
│   ├── main.py
│   └── ml_model.py
├── models
│   └── model_v1.joblib  # Your serialized model
├── requirements.txt
└── Dockerfile`}</Pre>
        <p>In this case, your <C>Dockerfile</C> can use the <C>COPY</C> instruction to place the model file into a designated location within the image:</p>
        <Pre>{`# Start from a Python base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./app /app/app

# --- Add a section to copy the model ---
# Create a directory for models inside the container
RUN mkdir /app/models
# Copy the model file from your host machine into the image
COPY ./models/model_v1.joblib /app/models/model_v1.joblib
# --- End of model copying section ---

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]`}</Pre>
        <p>
          Inside your FastAPI application (<C>app/ml_model.py</C> or similar), you would then load the model using the path
          specified in the <C>Dockerfile</C> (<C>/app/models/model_v1.joblib</C>).
        </p>
        <p className="font-semibold text-white">Advantages:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><span className="font-semibold text-white">Simplicity:</span> Easy to understand and implement.</li>
          <li>
            <span className="font-semibold text-white">Self-Contained Image:</span> The resulting Docker image contains everything
            needed to run the application, including the specific model version it was built with. This enhances reproducibility.
          </li>
        </ul>
        <p className="font-semibold text-white">Disadvantages:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold text-white">Image Size:</span> ML models can be large (hundreds of MBs or even GBs).
            Including them directly increases the Docker image size significantly, affecting storage, transfer times, and
            potentially cold start times.
          </li>
          <li>
            <span className="font-semibold text-white">Tight Coupling:</span> Every time you update the model file, you need to
            rebuild the Docker image, even if the application code hasn’t changed.
          </li>
          <li>
            <span className="font-semibold text-white">Repository Size:</span> Storing large model files directly in your Git
            repository is often discouraged (use Git LFS if you must, but it adds complexity).
          </li>
        </ul>
        <Hint>The image at the top is the self-contained template. Resetting a container clears only the files that container wrote.</Hint>
      </div>
    ),
  },
  {
    id: 'download-model',
    title: 'Strategy 2: Downloading Models During the Build',
    subtitle: 'The repository stays small. The build needs the URL to be reachable',
    Visual: DownloadModelVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p className="font-semibold text-white">Strategy 2: Downloading Models During the Build</p>
        <p>
          An alternative approach is to download the model from an external source during the Docker image build process. This
          source could be cloud storage (like AWS S3, Google Cloud Storage, Azure Blob Storage), a dedicated model registry, or
          even a simple HTTP URL.
        </p>
        <p>
          You would use the <C>RUN</C> instruction in your <C>Dockerfile</C> along with tools like <C>curl</C>, <C>wget</C>, or
          cloud-specific command-line tools.
        </p>
        <Pre>{`# Start from a Python base image
FROM python:3.10-slim

# Install necessary tools (e.g., curl) if not present in the base image
# RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* # Example for Debian-based images

# Set the working directory
WORKDIR /app

# Copy requirements first
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./app /app/app

# --- Add this section to download the model ---
# Define the model URL (could also use ARG for flexibility)
ARG MODEL_URL="https://your-storage-provider.com/models/model_v1.joblib"
# Create a directory for models
RUN mkdir /app/models
# Download the model using curl
RUN curl -o /app/models/model_v1.joblib \${MODEL_URL}
# --- End of model downloading section ---

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]`}</Pre>
        <p>You can pass the <C>MODEL_URL</C> as a build argument when building the image:</p>
        <Pre>{`docker build --build-arg MODEL_URL="<actual_model_url>" -t my-ml-api .`}</Pre>
        <p className="font-semibold text-white">Advantages:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><span className="font-semibold text-white">Decoupling:</span> Model artifacts are stored separately from the application code repository.</li>
          <li><span className="font-semibold text-white">Smaller Repository:</span> Your Git repository doesn’t need to store large model files.</li>
          <li>
            <span className="font-semibold text-white">Flexibility:</span> Easier to switch model versions by changing the build
            argument or the source URL without modifying the core <C>Dockerfile</C> logic significantly.
          </li>
        </ul>
        <p className="font-semibold text-white">Disadvantages:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold text-white">Build Dependency:</span> The Docker build process now depends on the
            availability and accessibility of the external model storage. Network issues or storage outages can cause builds to fail.
          </li>
          <li><span className="font-semibold text-white">Build Time:</span> Downloading large models can significantly increase image build time.</li>
          <li>
            <span className="font-semibold text-white">Security:</span> If the model storage requires authentication, you need a
            secure way to provide credentials during the build process. Docker build secrets or multi-stage builds can help manage
            this, preventing credentials from leaking into the final image layers.
          </li>
          <li>
            <span className="font-semibold text-white">Build Tools:</span> You might need to install additional tools (<C>curl</C>,{' '}
            <C>awscli</C>, <C>gcloud-sdk</C>, etc.) in the image just for the download step, potentially increasing image size
            unless you use multi-stage builds to discard these tools later.
          </li>
        </ul>
        <Hint>The repository has no model file. Run the build while the URL is up, then while it is down. The last button leaves curl in the image or drops it after the download.</Hint>
      </div>
    ),
  },
  {
    id: 'volume',
    title: 'Strategy 3: Mounting Models via Volumes',
    subtitle: 'Useful on your laptop. The production image should still contain the model',
    Visual: VolumeModelVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p className="font-semibold text-white">Strategy 3: Mounting Models via Volumes (Use with Caution for Deployment)</p>
        <p>
          Docker volumes allow you to mount a directory from the host machine or a managed Docker volume into the container at
          runtime. While useful for local development (e.g., quickly testing different models without rebuilding the image), using
          volumes to provide the primary model in a production deployment scenario is generally not recommended.
        </p>
        <p>
          It breaks the principle of having a self-contained, immutable image. The container’s functionality becomes dependent on
          an external filesystem being correctly mounted at runtime, which complicates deployment orchestration and
          reproducibility. If the volume isn’t mounted correctly, the application will fail. This approach is better suited for
          injecting configuration or perhaps runtime data, not core application artifacts like the model itself.
        </p>
        <Hint>Copy the model into the image, then switch so it stays on the host. Remove the mount and the container cannot find the file.</Hint>
      </div>
    ),
  },
  {
    id: 'practices',
    title: 'Best Practices',
    subtitle: 'Name the version, match the path, drop the download tools, keep the token out',
    Visual: BestPracticesVisualizer,
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-300">
        <p className="font-semibold text-white">Best Practices</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Model Versioning:</span> Explicitly manage which model version is included.
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold text-white">Direct Copy:</span> Use clear filenames (e.g., <C>model_v1.2.joblib</C>).
                Updating the model requires changing the filename in the <C>COPY</C> instruction and replacing the file.
              </li>
              <li>
                <span className="font-semibold text-white">Download:</span> Use build arguments (<C>ARG</C>) to specify the model
                version or URL, making it easier to parameterize builds in CI/CD pipelines.
              </li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-white">File Paths:</span> Ensure consistency. The path where the model is saved in
            the <C>Dockerfile</C> (e.g., <C>/app/models/</C>) must match the path used by your FastAPI application code to load the
            model. Using environment variables for the model path within the application can add flexibility.
          </li>
          <li>
            <span className="font-semibold text-white">Image Size Optimization:</span>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                If downloading, use multi-stage builds. One stage downloads the model using necessary tools, and a final, smaller
                stage copies only the application code and the downloaded model, discarding the download tools.
              </li>
              <li>Ensure your base Python image is reasonably small (e.g., <C>python:3.X-slim</C>).</li>
              <li>
                Clean up package manager caches (e.g., <C>apt-get clean</C>, <C>rm -rf /var/lib/apt/lists/*</C> for Debian/Ubuntu;{' '}
                <C>--no-cache-dir</C> for pip).
              </li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-white">Security for Downloads:</span> If downloading from protected storage, use
            secure methods like short-lived credentials injected via build arguments (with caution) or Docker’s build secrets
            management features (<C>--secret</C> flag) to avoid embedding sensitive keys in the image layers.
          </li>
        </ul>
        <p>
          Choosing the right strategy depends on your project’s complexity, team workflow, model size, and deployment environment.
          For many applications, copying the model directly offers simplicity, while downloading during the build provides better
          decoupling for more complex or frequently updated models managed in separate storage.
        </p>
        <Hint>Four pictures: the version in the filename or the build argument, the path the app loads, what the final stage keeps, and whether the token remains in a layer.</Hint>
      </div>
    ),
  },
];

export default function ContainerizationAndDeploymentPreparationPartOne() {
  return <ChapterDeck meta={meta} slides={slidesData} />;
}
