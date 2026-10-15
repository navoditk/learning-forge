import type { MouseEvent, RefObject } from 'react';

import {
  fieldFocusTargetId,
  FIELD_ERROR_MESSAGES,
  numberFormatHint,
  numberInputMode,
  type ResponseField,
  type ResponseSpec,
  type StructuredErrorState,
  type StructuredValues,
} from '../learner-data';

// Accessible structured answer fields (contract 3.4, A-1 to A-8). This
// component only collects and displays: it never judges a value, shows
// per-field correctness or derives anything from the answer. What is valid is
// decided by the server; the messages here are format guidance only.

export function StructuredResponseFields({
  spec,
  title,
  values,
  onChange,
  errors,
  summaryRef,
}: {
  spec: ResponseSpec;
  title: string;
  values: StructuredValues;
  onChange: (key: string, value: string) => void;
  errors?: StructuredErrorState;
  summaryRef: RefObject<HTMLDivElement | null>;
}) {
  const messageFor = (key: string) => errors?.items.find((item) => item.key === key)?.message;

  const focusField = (event: MouseEvent<HTMLAnchorElement>, key: string) => {
    event.preventDefault();
    const id = fieldFocusTargetId(spec, key);
    if (id) document.getElementById(id)?.focus();
  };

  return (
    <>
      {errors && errors.items.length > 0 && (
        <div
          role="alert"
          tabIndex={-1}
          ref={summaryRef}
          id="structured-error-summary"
          className="error-summary"
        >
          <p className="error-summary-title">
            <strong>{FIELD_ERROR_MESSAGES.summaryTitle}</strong>
          </p>
          <ul>
            {errors.items.map((item, index) => (
              <li key={`${item.key ?? 'general'}-${index}`}>
                {item.key ? (
                  <a
                    href={`#${fieldFocusTargetId(spec, item.key)}`}
                    onClick={(event) => focusField(event, item.key as string)}
                  >
                    {item.label}: {item.message}
                  </a>
                ) : (
                  item.message
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <fieldset className="structured-fields">
        <legend>Your answer: {title}</legend>
        {spec.fields.map((field) =>
          field.kind === 'choice' ? (
            <ChoiceField
              key={field.key}
              field={field}
              value={values[field.key] ?? ''}
              onChange={onChange}
              error={messageFor(field.key)}
            />
          ) : (
            <NumberField
              key={field.key}
              field={field}
              value={values[field.key] ?? ''}
              onChange={onChange}
              error={messageFor(field.key)}
            />
          ),
        )}
      </fieldset>
    </>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="field-error">
      <span className="visually-hidden">Error: </span>
      {message}
    </p>
  );
}

function NumberField({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<ResponseField, { kind: 'number' }>;
  value: string;
  onChange: (key: string, value: string) => void;
  error?: string;
}) {
  const inputId = `srn-${field.key}`;
  const hintId = `srh-${field.key}`;
  const unitId = `sru-${field.key}`;
  const errorId = `sre-${field.key}`;
  const describedBy = [hintId, field.unitLabel ? unitId : undefined, error ? errorId : undefined]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="structured-field">
      <label htmlFor={inputId}>{field.label}</label>
      <p id={hintId} className="field-hint">
        <small>{numberFormatHint(field)}</small>
      </p>
      {error && <FieldError id={errorId} message={error} />}
      <div className="field-input-row">
        <input
          id={inputId}
          name={field.key}
          type="text"
          inputMode={numberInputMode(field.representations)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
        />
        {field.unitLabel && (
          <span id={unitId} className="field-unit">
            {field.unitLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function ChoiceField({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<ResponseField, { kind: 'choice' }>;
  value: string;
  onChange: (key: string, value: string) => void;
  error?: string;
}) {
  const errorId = `sre-${field.key}`;
  return (
    <fieldset
      id={`srg-${field.key}`}
      className="structured-field structured-choice"
      role="radiogroup"
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>{field.label}</legend>
      {error && <FieldError id={errorId} message={error} />}
      {field.options.map((option) => {
        const optionId = `srr-${field.key}-${option.id}`;
        return (
          <div key={option.id} className="choice-option">
            <input
              id={optionId}
              type="radio"
              name={`sr-${field.key}`}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(field.key, option.id)}
            />
            <label htmlFor={optionId}>{option.label}</label>
          </div>
        );
      })}
    </fieldset>
  );
}
