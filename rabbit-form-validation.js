import { VALIDATION_TYPE } from "../../constants/constants.js";
import { debounce } from "../../utils/helpers.js";

export default function ValidableForm() {
  const form = document.querySelector(`form[${VALIDATION_TYPE.VALIDABLE}]`)
  const validableTextInputs = form.querySelectorAll(`input[${VALIDATION_TYPE.VALIDABLE}][type="text"]`)
  const validableCheckbox = form.querySelectorAll(`input[${VALIDATION_TYPE.VALIDABLE}][type="checkbox"]`)

  const { lengthInputs, minmaxInputs, regexpInputs } = Object.groupBy(validableTextInputs, (input) => {
    if (input.hasAttribute(VALIDATION_TYPE.LENGTH)) {
      return 'lengthInputs'
    }
    if (input.hasAttribute(VALIDATION_TYPE.MIN) || input.hasAttribute(VALIDATION_TYPE.MAX)) {
      return 'minmaxInputs'
    }
    if (input.hasAttribute(VALIDATION_TYPE.REGEXP)) {
      return 'regexpInputs'
    }
    return 'undefined'
  })

  let { lengthCheckboxes, minmaxCheckboxes } = Object.groupBy(validableCheckbox, (checkbox) => {
    if (checkbox.hasAttribute(VALIDATION_TYPE.LENGTH)) {
      return 'lengthCheckboxes'
    }
    if (checkbox.hasAttribute(VALIDATION_TYPE.MIN) || checkbox.hasAttribute(VALIDATION_TYPE.MAX)) {
      return 'minmaxCheckboxes'
    }
    return 'undefined'
  })

  lengthCheckboxes ??= Object.values(
    Object.groupBy(lengthCheckboxes ?? [], ({ name }) => {
      return name
    })
  )

  minmaxCheckboxes = Object.values(
    Object.groupBy(minmaxCheckboxes ?? [], ({ name }) => {
      return name
    })
  )

  lengthInputs ?? [].forEach(input => {
    input.addEventListener('input', debounce(() => {
      const { value, dataset } = input
      const { rabbitLength } = dataset

      if (value.length > rabbitLength) {
        const excess = rabbitLength - value.length
        input.value = value.slice(0, excess)
      }
    }, 250))

    input.addEventListener('blur', () => {
      const { id, value, dataset } = input
      const { rabbitLength } = dataset

      if (value.length !== rabbitLength) {
        console.error(`Campo invalido <${id}> <${value}>`)
      }
    })
  })

  minmaxInputs.forEach(input => {
    input.addEventListener('input', debounce(() => {
      const { value, dataset } = input
      const { rabbitMax } = dataset

      input.classList.remove('is-invalid')
      input.classList.remove('is-valid')

      if (value.length > rabbitMax) {
        const excess = rabbitMax - value.length
        input.value = value.slice(0, excess)
      }
    }, 250))

    input.addEventListener('blur', () => {
      const { id, value, dataset } = input
      const { rabbitMin, rabbitMax } = dataset

      let isValidInput = true

      if (value.length < rabbitMin && isValidInput) {
        console.error(`Campo invalido <${id}> <${value}>`)
        isValidInput = false
      }

      if (value.length > rabbitMax && isValidInput) {
        console.error(`Campo invalido <${id}> <${value}>`)
        isValidInput = false
      }

      if (!isValidInput) {
        input.classList.add('is-invalid')
        return
      }

      input.classList.add('is-valid')
    })
  })

  regexpInputs.forEach(input => {
    input.addEventListener('blur', () => {
      const { id, value, dataset } = input
      const { rabbitRegexp } = dataset
      const regexp = new RegExp(rabbitRegexp)

      if (!regexp.test(value)) {
        console.error(`Campo invalido <${id}> <${value}>`)
        input.classList.add('is-invalid')
      }
    })

    input.addEventListener('input', debounce(() => {

      const { id, value, dataset } = input
      const { rabbitRegexp } = dataset
      const regexp = new RegExp(rabbitRegexp)

      input.classList.remove('is-invalid')
      input.classList.remove('is-valid')

      if (regexp.test(value)) {
        input.classList.add('is-valid')
      }
    }, 250))
  })

  form.addEventListener('submit', () => {
    console.log('submit')
  })
}