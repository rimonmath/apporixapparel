<script setup lang="ts">
import { ref, watch, shallowRef, provide } from 'vue';
import type { z, ZodObject, ZodRawShape, ZodType } from 'zod';
import type { FormErrors } from '@/utils/types.js';

// ---- Props ----
type SchemaType = ZodObject<ZodRawShape>;

interface Props<S extends SchemaType> {
  schema: S;
  formData: z.infer<S>;
  debug?: boolean;
}

const props = defineProps<Props<SchemaType>>();

// ---- Emits ----
const emit = defineEmits<{
  (e: 'successSubmit', formData: typeof props.formData): void;
}>();

// ---- State ----

const errors = ref<FormErrors>({});
const submittedOnce = shallowRef(false);

// ---- Validation ----
function validate() {
  const result = props.schema.safeParse(props.formData);

  if (!result.success) {
    const e: FormErrors = {};
    result.error.issues.forEach((err) => {
      if (err.path[0] !== undefined) {
        e[String(err.path[0])] = err.message;
      }
    });
    errors.value = e;

    const firstPath = result.error.issues[0]?.path[0];
    if (firstPath !== undefined) {
      const elementToFocus = document.querySelector<HTMLElement>(`[name="${String(firstPath)}"]`);
      elementToFocus?.focus();
    }

    if (props.debug) {
      console.error(result.error);
    }
  } else {
    errors.value = {};
  }
}

function validateField(fieldName: keyof typeof props.formData) {
  if (!submittedOnce.value) return;

  const fieldSchema = (props.schema.shape as Record<string, ZodType>)[String(fieldName)];
  if (!fieldSchema) return;

  const result = fieldSchema.safeParse(props.formData[fieldName]);

  if (!result.success) {
    errors.value[String(fieldName)] = result.error.issues[0].message;
  } else {
    delete errors.value[String(fieldName)];
  }
}

function handleSubmit() {
  submittedOnce.value = true;
  validate();

  if (Object.keys(errors.value).length > 0) {
    // console.error('Validation errors:', errors.value);
    return;
  }

  emit('successSubmit', props.formData);
}

// ---- Watch ----
let prevFormData = { ...props.formData };
watch(
  () => props.formData,
  (newValue) => {
    if (!submittedOnce.value) return;

    for (const key in newValue) {
      if (newValue[key] !== prevFormData[key]) {
        validateField(key as keyof typeof props.formData);
      }
    }
    prevFormData = { ...newValue };
  },
  { deep: true }
);

provide('errors', errors);
provide('formData', props.formData);
</script>

<template>
  <!-- {{ errors }} -->
  <form @submit.prevent="handleSubmit">
    <slot name="default" :errors="errors"></slot>
  </form>
</template>
