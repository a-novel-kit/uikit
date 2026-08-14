<script module lang="ts">
  import {
    Button,
    Checkbox,
    Combobox,
    ErrorSummary,
    Field,
    Fieldset,
    FileInput,
    Grid,
    Input,
    RadioGroup,
    Select,
    Slider,
    Stack,
    Switch,
    Textarea,
  } from "@a-novel-kit/uikit";
  import { LockIcon, SearchIcon, UsersIcon } from "@a-novel-kit/uikit-icons";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const visibilityOptions = [
    { value: "private", label: "Private" },
    { value: "organization", label: "Organization" },
    { value: "public", label: "Public", disabled: true },
  ] as const;

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fr", label: "French" },
    { value: "de", label: "German", disabled: true },
    { value: "es", label: "Spanish" },
    { value: "ja", label: "Japanese" },
    { value: "ar", label: "Arabic" },
    { value: "bn", label: "Bengali" },
    { value: "zh", label: "Chinese" },
    { value: "nl", label: "Dutch" },
    { value: "hi", label: "Hindi" },
    { value: "it", label: "Italian" },
    { value: "ko", label: "Korean" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "ru", label: "Russian" },
    { value: "sv", label: "Swedish" },
    { value: "tr", label: "Turkish" },
    { value: "uk", label: "Ukrainian" },
    { value: "vi", label: "Vietnamese" },
  ] as const;

  const { Story } = defineMeta({
    title: "Forms/Controls",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Compose standalone controls with Field for labels, hints, errors, and required state. Optional content accepts text or snippets.",
        },
      },
    },
  });
</script>

<Story name="Text fields" asChild>
  <form class="form" onsubmit={(event) => event.preventDefault()}>
    <Grid minItemWidth="lg" gap="4">
      <Field label="Project name" hint="Use a short name people can scan." required>
        {#snippet children(control)}
          <Input {...control} placeholder="Untitled project" />
        {/snippet}
      </Field>
      <Field label="Visibility">
        {#snippet children(control)}
          <Select {...control} options={visibilityOptions} allowDeselect />
        {/snippet}
      </Field>
    </Grid>
    <Field label="Description" hint="Plain text, up to 500 characters.">
      {#snippet children(control)}
        <Textarea {...control} rows={4} autoSize placeholder="What is this project for?" />
      {/snippet}
    </Field>
    <Field label="Slug" error="This slug is already in use.">
      {#snippet children(control)}
        <Input {...control} value="agora" invalid />
      {/snippet}
    </Field>
    <Button type="submit">Create project</Button>
  </form>
</Story>

<Story name="File upload" asChild>
  <div class="narrow">
    <Field label="Reference files" hint="Choose one or more PDF, EPUB, or text files.">
      {#snippet children(control)}
        <FileInput {...control} name="references" accept=".pdf,.epub,.txt" multiple />
      {/snippet}
    </Field>
  </div>
</Story>

<Story name="Validation summary" asChild>
  <form class="form" onsubmit={(event) => event.preventDefault()}>
    <ErrorSummary
      errors={[
        { id: "project-name", href: "#invalid-project-name", message: "Enter a project name" },
        { id: "project-owner", href: "#invalid-project-owner", message: "Choose a project owner" },
      ]}
    />
    <Field controlId="invalid-project-name" label="Project name" error="Enter a project name" required>
      {#snippet children(control)}
        <Input {...control} invalid />
      {/snippet}
    </Field>
    <Field controlId="invalid-project-owner" label="Project owner" error="Choose a project owner" required>
      {#snippet children(control)}
        <Select {...control} options={[]} placeholder="Choose an owner" invalid />
      {/snippet}
    </Field>
    <Button type="submit">Save project</Button>
  </form>
</Story>

<Story name="Adornments" asChild>
  <div class="adornment-grid">
    <Field label="Search">
      {#snippet children(control)}
        <Input {...control} placeholder="Search projects">
          {#snippet startAdornment()}
            <SearchIcon size="var(--icon-size-sm)" aria-hidden="true" />
          {/snippet}
          {#snippet endAdornment()}
            <kbd>⌘ K</kbd>
          {/snippet}
        </Input>
      {/snippet}
    </Field>
    <Field label="Summary">
      {#snippet children(control)}
        <Textarea {...control} rows={4} placeholder="Describe the project">
          {#snippet startAdornment()}
            <span>Plain text supported</span>
          {/snippet}
          {#snippet endAdornment()}
            <span class="count">0 / 500</span>
          {/snippet}
        </Textarea>
      {/snippet}
    </Field>
  </div>
</Story>

<Story name="Choices" asChild>
  <Stack gap="6">
    <Fieldset legend="Notifications" description="Choose persistent preferences with native controls.">
      <Checkbox label="Product updates" description="Occasional release and maintenance notes." checked />
      <Switch label="Desktop alerts" description="Show an alert while Agora is in the background." checked />
    </Fieldset>
    <RadioGroup
      legend="Density"
      value="comfortable"
      orientation="horizontal"
      options={[
        { value: "compact", label: "Compact" },
        { value: "comfortable", label: "Comfortable" },
        { value: "spacious", label: "Spacious", disabled: true },
      ]}
    />
    <Slider label="Preview scale" value={72} min={50} max={150} />
  </Stack>
</Story>

<Story name="Searchable selection" asChild>
  <div class="narrow">
    <Field label="Language" hint="Type to filter the available options.">
      {#snippet children(control)}
        <Combobox
          {...control}
          name="language"
          placeholder="Search languages"
          value="en"
          options={languageOptions}
          maxMenuHeight="calc(var(--control-height-sm) * var(--multiplier-5))"
        />
      {/snippet}
    </Field>
  </div>
</Story>

<Story name="Composition" asChild>
  <div class="composition-grid">
    <Field>
      {#snippet children(control)}
        <Input {...control} aria-label="Quick search" placeholder="Field without a visible label" />
      {/snippet}
    </Field>

    <Field hint="Choose the selected option again to clear the value.">
      {#snippet label()}
        <span class="label-with-icon">
          <LockIcon size="var(--icon-size-sm)" aria-hidden="true" />
          Visibility
        </span>
      {/snippet}
      {#snippet children(control)}
        <Select {...control} options={visibilityOptions} allowDeselect>
          {#snippet renderOption(option)}
            <span class="option-with-icon">
              {#if option.value === "private"}
                <LockIcon size="var(--icon-size-sm)" aria-hidden="true" />
              {:else}
                <UsersIcon size="var(--icon-size-sm)" aria-hidden="true" />
              {/if}
              {option.label}
            </span>
          {/snippet}
        </Select>
      {/snippet}
    </Field>

    <Checkbox>
      {#snippet label()}
        <span>Use <strong>compact</strong> navigation</span>
      {/snippet}
      {#snippet description()}
        <span>Composition can include inline markup and components.</span>
      {/snippet}
    </Checkbox>
  </div>
</Story>

<style>
  .form {
    display: grid;
    gap: var(--space-5);
    inline-size: min(100%, var(--layout-container-sm));
  }
  .form > :global(button) {
    justify-self: start;
  }
  .narrow {
    inline-size: min(100%, calc(var(--space-base) * var(--multiplier-80)));
  }
  .adornment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--space-base) * var(--multiplier-64))), 1fr));
    align-items: start;
    gap: var(--space-6);
    inline-size: 100%;
  }
  .composition-grid {
    display: grid;
    align-items: start;
    gap: var(--space-6);
    inline-size: min(100%, var(--layout-container-sm));
  }
  .label-with-icon,
  .option-with-icon {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }
  :global(kbd) {
    border: var(--border-width-thin) solid var(--color-border-default);
    border-radius: var(--radius-sm);
    background: var(--color-surface-raised);
    padding: var(--space-1) var(--space-2);
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
  }
  .count {
    margin-inline-start: auto;
  }
</style>
