python: 3.10.6 (Anaconda environment recommended) and Google Chrome

cd app  
npm install  
npm run start  
cd ..  
cd whisper_server  
pip install -r requirements.txt  
python server.py  

### Database

It uses sqlite. The database can be deleted and recreated through the `create_database.py` script.

### whisper

might require installing ffmpeg  

on Ubuntu or Debian  
sudo apt update && sudo apt install ffmpeg  

on Arch Linux  
sudo pacman -S ffmpeg  

on MacOS using Homebrew (https://brew.sh/)  
brew install ffmpeg  

on Windows using Chocolatey (https://chocolatey.org/)  
choco install ffmpeg  

on Windows using Scoop (https://scoop.sh/)  
scoop install ffmpeg  

You may need [rust](http://rust-lang.org/) installed as well, in case [tiktoken](https://github.com/openai/tiktoken) does not provide a pre-built wheel for your platform. If you see installation errors during the `pip install` command above, please follow the [Getting started](https://www.rust-lang.org/learn/get-started) page to install Rust development environment. Additionally, you may need to configure the `PATH` environment variable, e.g. `export PATH="$HOME/.cargo/bin:$PATH"`. If the installation fails with `No module named 'setuptools_rust'`, you need to install `setuptools_rust`, e.g. by running:  

pip install setuptools-rust