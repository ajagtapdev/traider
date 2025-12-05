import sys
from glob import glob
from setuptools import setup
from pybind11.setup_helpers import Pybind11Extension, build_ext

# Define the extension module
ext_modules = [
    Pybind11Extension(
        "traider_cpp",
        sorted(glob("cpp/**/*.cpp", recursive=True)),  # Recursively find all cpp files
        include_dirs=["cpp"],
        cxx_std=17,
        extra_compile_args=["/O2"] if sys.platform == "win32" else ["-O3"],
    ),
]

setup(
    name="traider_cpp",
    version="0.1.0",
    author="Traider Team",
    description="High-performance C++ trading engine for Traider",
    ext_modules=ext_modules,
    cmdclass={"build_ext": build_ext},
    zip_safe=False,
    python_requires=">=3.7",
)

