from flask import Flask

app = Flask(__name__)

@app.post("/register")
def register():
    pass

if __name__=="__main__":
    app.run(debug=True)