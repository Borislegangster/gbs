import type React from "react"
import type { FieldError } from "react-hook-form"

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  error?: FieldError | string
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  error,
  icon,
  children,
  className = "",
  ...props
}: FormFieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorMessage = typeof error === "string" ? error : error?.message
  const hasError = !!errorMessage

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}

        {children || (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            className={`
              w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent
              ${icon ? "pl-10" : ""}
              ${hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
            `}
            {...props}
          />
        )}
      </div>

      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  )
}

interface TextAreaFieldProps extends Omit<FormFieldProps, "type"> {
  rows?: number
}

export function TextAreaField({
  label,
  name,
  placeholder,
  required = false,
  error,
  rows = 4,
  className = "",
  ...props
}: TextAreaFieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errorMessage = typeof error === "string" ? error : error?.message
  const hasError = !!errorMessage

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent resize-none
          ${hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
        `}
        {...props}
      />

      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  )
}

interface SelectFieldProps extends Omit<FormFieldProps, "type"> {
  options: Array<{ value: string; label: string }>
}

export function SelectField({
  label,
  name,
  required = false,
  error,
  options,
  className = "",
  ...props
}: SelectFieldProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const errorMessage = typeof error === "string" ? error : error?.message
  const hasError = !!errorMessage

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={name}
        name={name}
        className={`
          w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent
          ${hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  )
}
