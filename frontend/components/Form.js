import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.

const initialFormValues = {
  fullName: "",
  size: "",
  Pepperoni: false,
  'Green Peppers': false,
  Pineapple: false,
  Mushrooms: false,
  Ham: false 
}

const initialFormErrors = {
  fullName: '',
  size: ''
}

const initialDisabled = true

const formSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .required()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
    size: yup
    .string()
    .trim()
    .required(validationErrors.sizeIncorrect),
    Pepperoni: yup.boolean(),
    'Green Peppers': yup.boolean(),
    Pineapple: yup.boolean(),
    Mushrooms: yup.boolean(),
    Ham: yup.boolean()
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form(props) {
const [formValues, setForm] = useState(initialFormValues)
const [formErrors, setFormErrors] = useState(initialFormErrors)
const [disabled, setDisabled] = useState(initialDisabled)
// const {submit} = props
const [isSuccess, setIsSuccess] = useState(false)
const [isError, setIsError] = useState(false)
const [submittedForm, setSubmittedForm] = useState(null)



  const postNewForm = newForm => {
    axios.post('http://localhost:9009/api/order', newForm)
      .then(res => {
        setForm([res.data, ...formValues])
      }).catch(err => console.log(err))
        .finally(() => setForm(initialFormValues))
  }

  const validate = (form, value) => {
    yup.reach(formSchema, form)
       .validate(value)
       .then(() => setFormErrors({...formErrors, [form]: ''}))
       .catch(err => setFormErrors({...formErrors, [form]: err.errors[0]}))
  }

  const validateForm = () => {
    formSchema.isValid(formValues).then(valid => {
      setDisabled(!valid)
    })
  }

  useEffect(() => {
    validateForm()
  }, [formValues])

  const inputChange = (form, value) => {
    validate(form, value)
    setForm({
      ...formValues, [form]: value
    })
  }

  const formSubmit = async (evt) => {
    evt.preventDefault()
    const selectedToppings = toppings.filter((topping) => formValues[topping.text])
    const newForm = {
      fullName: formValues.fullName.trim(),
      size: formValues.size.trim(),
      toppings: selectedToppings
    };
setSubmittedForm(newForm)

    try {
      await postNewForm(newForm)
      setIsSuccess(true)
      setIsError(false)
    } catch (error) {
      console.error(error)
      setIsSuccess(false)
      setIsError(true)
    }
  };

  const handleCheckboxChange = (evt) => {
    const { name, checked } = evt.target
    setForm((prevFormValues) => ({
      ...prevFormValues,
      [name]: checked ? true : false
    }));
    validate(name, checked)
  };
  
  return (
    <form className='form-container' onSubmit={formSubmit}>
      <h2>Order Your Pizza</h2>
      {isSuccess && <div className='success'>Thank you for your order, {submittedForm.fullName}! Your {submittedForm.size} pizza with {submittedForm.toppings.length === 0 ? 'no toppings' : submittedForm.toppings.length === 1 ? '1 topping' : `${submittedForm.toppings.length} toppings`} is on the way.</div>}
      {isError && <div className='failure'>Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input 
          placeholder="Type full name" 
          id="fullName" 
          type="text"
          value={formValues.fullName}
          onChange={(e) => inputChange('fullName', e.target.value)} />
        </div>
        {!!formErrors.fullName && <div className='error'>{formErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select 
          id="size"
          value={formValues.size}
          onChange={(e) => inputChange('size', e.target.value)}
          >
            <option value="">----Choose Size----</option>
            <option value='small'>Small</option>
            <option value='medium'>Medium</option>
            <option value='large'>Large</option>
          </select>
        </div>
        {!!formErrors.size && <div className='error'>{formErrors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              name={topping.text} 
              type="checkbox"
              checked={formValues[topping.text]} 
              onChange={handleCheckboxChange} 
            />
            {topping.text}
            <br />
          </label>
        ))}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      
      <input disabled={disabled} type="submit" />
    </form>
  )
}
