import React, {useState} from 'react';
import '../styles/inputPages.css';

function InputField({labelName, change, changeHandler}) {
    return(
        <form>
            <label>
                {labelName}
            </label>
            <br></br>
            <input
                style={{width: '50ch'}}
                className="inputField"
                type="text"
                value={change}
                onChange={(e) => changeHandler(e.target.value)}
            />
        </form>
    );
}
function DescriptionBox({labelName, change, changeHandler}) {
    return(
        <form>
            <label>
                {labelName}
            </label>
            <br></br>
            <p>
                <textarea
                    rows="4"
                    style={{width: '50ch'}}
                    value={change}
                    onChange={(e) => changeHandler(e.target.value)}
                ></textarea>
            </p>
        </form>
    );
}
function AddPicture({change, changeHandler}) {
    return (
        <form>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {  const file = e.target.files[0];
                                                                        changeHandler(file);            }} />

            {change && <img src={URL.createObjectURL(change)} alt="Uploaded" style={{maxWidth: '150px', maxHeight: '150px'}} />}
        </form>
    );
}
function SubmitButton( {handler} ) {
    return (
        <form>
            <button type="button" className="btn btn-primary" onClick={handler}>Submit</button>
        </form>
    );
}

function ConditionDropdown({change, changeHandler}) {
    return (
        <div className="dropdown">
            <label>
                Condition
            </label>
            <select value={change} onChange={(e) => changeHandler(e.target.value)}>
                <option value="">Select an Option</option>
                <option value="New/Good">Good Condition</option>
                <option value="Used/Pre-Owned">Used/Pre-Owned</option>
                <option value="Refurbished">Refurbished</option>
                <option value="Damaged">Damaged</option>
            </select>
        </div>
    );

}

function CategoryDropdown({change, changeHandler}) {
    return (
        <div className="dropdown">
            <label>
                Category
            </label>
            <select value={change} onChange={(e) => changeHandler(e.target.value)}>
                <option value="">Select an Option</option>
                <option value="Apparel">Apparel</option>
                <option value="Technology">Technology</option>
                <option value="Automobiles">Automobiles</option>
                <option value="Games">Games</option>
                <option value="Home">Home</option>
            </select>
        </div>
    );
}

function CreateListingContainer() {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState(null);

    const [condition, setCondition] = useState('');
    const [category, setCategory] = useState('');

    console.log("CONDITION: ", condition);
    console.log("CATEGORY: ", category);

    const apiUrl = 'http://localhost:5000/api/createListing';

    async function sendData() {
        const data = { name, location: location, price: isNaN(price) ? 0 : price, desc, image, condition, category};
        // Default options are marked with *
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('location', location);
            formData.append('price', price);
            formData.append('desc', desc);
            formData.append('image', image);
            formData.append('condition', condition);
            formData.append('category', category);

            const response = await fetch(apiUrl, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached

                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: formData, // body data type must match "Content-Type" header
            })
            if (response.ok) {
                console.log("Successful create listing");
            }
            else {
                console.log("Create listing failed");
            }

        }
        catch (error) {
            console.error('Error fetching data: ', error);
        }

    }

    return (
        <div className="container" style={{marginTop: '8vh'}}>
            <h1>
                Create a Listing
            </h1>
            <InputField
                labelName="Name"
                change={name}
                changeHandler={setName} />

            <InputField
                labelName="Location"
                change={location}
                changeHandler={setLocation} />

            <InputField
                labelName="Price"
                change={price}
                changeHandler={setPrice} />

            <DescriptionBox
                labelName="Description"
                change={desc}
                changeHandler={setDesc} />

            <br />

            <div className="dropdown-container">
                <ConditionDropdown change={condition}
                                   changeHandler={setCondition} />
                <br />
                <CategoryDropdown change={category}
                                  changeHandler={setCategory} />
            </div>

            <br />

            <AddPicture
                change={image}
                changeHandler={setImage} />

            <br />

            <SubmitButton
                handler={sendData}
            />
        </div>
    );
}




export default CreateListingContainer;