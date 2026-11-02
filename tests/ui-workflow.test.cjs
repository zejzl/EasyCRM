// Offline component regressions using the existing TypeScript/React dependencies.
// Presentation primitives are native stand-ins; no API, database or Next server.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.join(__dirname, '..', 'apps', 'web');

function compile(relative, imports = {}) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  assert.deepEqual(
    (output.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error),
    []
  );
  const module = { exports: {} };
  const load = (id) =>
    Object.prototype.hasOwnProperty.call(imports, id) ? imports[id] : require(id);
  new Function('require', 'module', 'exports', output.outputText)(load, module, module.exports);
  return module.exports;
}

const helpers = compile('lib/utils/table.ts');
const primitive = (tag) =>
  React.forwardRef(function Primitive({ children, variant, size, ...props }, ref) {
    return React.createElement(tag, { ...props, ref }, children);
  });
const icons = new Proxy({}, { get: () => (props) => React.createElement('svg', props) });
const { DataTable } = compile('components/shared/DataTable.tsx', {
  '@/components/ui/table': Object.fromEntries(
    [
      ['Table', 'table'],
      ['TableBody', 'tbody'],
      ['TableCell', 'td'],
      ['TableHead', 'th'],
      ['TableHeader', 'thead'],
      ['TableRow', 'tr'],
    ].map(([name, tag]) => [name, primitive(tag)])
  ),
  '@/components/ui/button': { Button: primitive('button') },
  '@/components/ui/input': { Input: primitive('input') },
  'lucide-react': icons,
  '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
  '@/lib/utils/table': helpers,
});

const columns = [
  { key: 'name', header: 'Company' },
  { key: '_count.contacts', header: 'Contacts' },
];
const render = (props = {}) =>
  renderToStaticMarkup(
    React.createElement(DataTable, {
      columns,
      data: [],
      onSearchChange() {},
      searchPlaceholder: 'Search companies...',
      ...props,
    })
  );

test('nested CRM counts display actual values, including zero', () => {
  assert.match(
    render({ data: [{ id: 'a', name: 'Acme', _count: { contacts: 7 } }] }),
    /<td[^>]*>7<\/td>/
  );
  assert.equal(helpers.getColumnValue({ _count: { contacts: 0 } }, '_count.contacts'), 0);
});

test('missing paths are safe and prototype properties are not exposed', () => {
  assert.equal(helpers.getColumnValue({ company: null }, 'company.name'), undefined);
  assert.equal(helpers.getColumnValue({}, 'constructor.name'), undefined);
  assert.equal(helpers.getColumnValue(null, 'name'), undefined);
});

test('filtered empty state offers clearing search, not creating another record', () => {
  const html = render({ searchValue: 'Missing', onCreate() {}, createLabel: 'Add Company' });
  assert.match(html, /No matching records/);
  assert.match(html, /Clear search/);
  assert.doesNotMatch(html, /Add Company/);
});

test('first-use empty state has an actionable create button', () => {
  const html = render({
    onCreate() {},
    createLabel: 'Add Company',
    emptyMessage: 'No companies yet',
  });
  assert.match(html, /No companies yet/);
  assert.match(html, /Add Company/);
  assert.match(html, /0 results/);
});

test('request errors preserve the search and offer retry without stale results', () => {
  const html = render({ error: 'Network unavailable', onRetry() {}, searchValue: 'Acme' });
  assert.match(html, /role="alert"/);
  assert.match(html, /value="Acme"/);
  assert.match(html, /Try again/);
  assert.doesNotMatch(html, /<table/);
});

test('loading is announced without presenting a false empty state', () => {
  const html = render({ loading: true });
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /Loading records/);
  assert.doesNotMatch(html, /No data found|0 results/);
});

test('single-page totals remain visible', () => {
  const html = render({
    data: [{ id: 'a', name: 'Acme' }],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  assert.match(html, /Showing 1–1 of 1 results/);
});

test('pagination buttons have accessible names and real last-page bounds', () => {
  const html = render({
    data: [{ id: 'a', name: 'Acme' }],
    onPageChange() {},
    pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
  });
  assert.match(html, /Showing 21–21 of 21 results/);
  assert.match(html, /aria-label="Next page"[^>]*disabled/);
  assert.match(html, /aria-label="Previous page"/);
});

test('empty pages never report an inverted result range', () => {
  assert.deepEqual(helpers.resultRange(3, 20, 40, 0), { start: 0, end: 0, total: 40 });
});

// Exercise page callbacks with isolated hook state, not a real browser/router.
function nodes(element) {
  if (!React.isValidElement(element)) return [];
  return [element, ...React.Children.toArray(element.props.children).flatMap(nodes)];
}

for (const [kind, plural] of [
  ['Company', 'companies'],
  ['Contact', 'contacts'],
]) {
  function pageHarness(failDelete) {
    let slots = [],
      cursor = 0,
      calls = 0;
    const mutation = { reset() {}, isError: false, isPending: false, async mutateAsync() {} };
    const deletion = {
      ...mutation,
      async mutateAsync() {
        calls++;
        if (failDelete) throw new Error('offline');
      },
    };
    const record = { id: 'a', name: 'Acme', firstName: 'Ada', lastName: 'Lovelace' };
    const query = { data: { data: [record] }, isLoading: false, isFetching: false, refetch() {} };
    const dataTable = () => null;
    const form = () => null;
    const alerts = Object.fromEntries(
      [
        'AlertDialog',
        'AlertDialogCancel',
        'AlertDialogContent',
        'AlertDialogDescription',
        'AlertDialogFooter',
        'AlertDialogHeader',
        'AlertDialogTitle',
      ].map((name) => [name, primitive('div')])
    );
    const api = {
      [`use${plural[0].toUpperCase() + plural.slice(1)}`]: () => query,
      [`useCreate${kind}`]: () => mutation,
      [`useUpdate${kind}`]: () => mutation,
      [`useDelete${kind}`]: () => deletion,
    };
    const { default: Page } = compile(`app/(dashboard)/${plural}/page.tsx`, {
      react: {
        ...React,
        useState(initial) {
          const index = cursor++;
          if (!(index in slots)) slots[index] = initial;
          return [
            slots[index],
            (next) => {
              slots[index] = typeof next === 'function' ? next(slots[index]) : next;
            },
          ];
        },
      },
      'next/navigation': { useRouter: () => ({ push() {} }) },
      'lucide-react': icons,
      '@/components/ui/button': { Button: primitive('button') },
      '@/components/ui/alert-dialog': alerts,
      [`@/lib/api/${plural}.api`]: api,
      '@/components/shared/DataTable': { DataTable: dataTable },
      [`@/components/${plural}/${kind}Form`]: { [`${kind}Form`]: form },
    });
    let tree;
    const renderPage = () => {
      cursor = 0;
      tree = Page();
      return tree;
    };
    const table = () => nodes(tree).find((node) => node.type === dataTable).props;
    renderPage();
    return {
      renderPage,
      table,
      calls: () => calls,
      slots,
      dialog: () => nodes(tree).find((node) => node.type === alerts.AlertDialog),
      async deleteRecord() {
        const actions = table()
          .columns.find((column) => column.key === 'actions')
          .render(undefined, record);
        nodes(actions)
          .find((node) => node.props['aria-label']?.startsWith('Delete '))
          .props.onClick();
        renderPage();
        const button = nodes(tree).find((node) => node.props.variant === 'destructive');
        await button.props.onClick();
        renderPage();
      },
      messages: () =>
        nodes(tree)
          .filter((node) => node.props.role === 'alert')
          .map((node) => node.props.children),
    };
  }

  test(`${kind}: failed deletion stays open with a visible retry message`, async () => {
    const page = pageHarness(true);
    await page.deleteRecord();
    assert.equal(page.calls(), 1);
    assert.equal(page.dialog().props.open, true);
    assert.deepEqual(page.messages(), ['Could not confirm deletion. Please try again.']);
  });

  test(`${kind}: deleting the only record on page two returns to page one`, async () => {
    const page = pageHarness(false);
    page.table().onPageChange(2);
    page.renderPage();
    await page.deleteRecord();
    assert.equal(page.dialog().props.open, false);
    assert.equal(page.slots[0].page, 1);
  });

  test(`${kind}: searching resets pagination and remains controlled after retry`, () => {
    const page = pageHarness(false);
    page.table().onPageChange(3);
    page.renderPage();
    page.table().onSearchChange('Acme');
    page.renderPage();
    assert.equal(page.slots[0].page, 1);
    assert.equal(page.table().searchValue, 'Acme');
    page.table().onRetry();
    page.renderPage();
    assert.equal(page.table().searchValue, 'Acme');
  });

  test(`${kind}: the mounted form resets for another record, not while typing`, () => {
    const resets = [];
    let previousDeps;
    const source = fs.readFileSync(path.join(root, `components/${plural}/${kind}Form.tsx`), 'utf8');
    const tree = ts.createSourceFile(
      'form.tsx',
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const imports = {};
    for (const statement of tree.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !statement.moduleSpecifier.text.startsWith('@/components/ui/')
      )
        continue;
      imports[statement.moduleSpecifier.text] = Object.fromEntries(
        statement.importClause.namedBindings.elements.map((name) => [
          name.name.text,
          primitive('div'),
        ])
      );
    }
    const state = {
      register: () => ({}),
      handleSubmit: (fn) => fn,
      setValue() {},
      watch() {},
      reset: (values) => resets.push(values),
      formState: { errors: {}, isSubmitting: false },
    };
    const module = compile(`components/${plural}/${kind}Form.tsx`, {
      ...imports,
      react: {
        ...React,
        useEffect(effect, deps) {
          if (!previousDeps || deps.some((dep, index) => dep !== previousDeps[index])) effect();
          previousDeps = deps;
        },
      },
      'react-hook-form': { useForm: () => state },
      '@hookform/resolvers/zod': { zodResolver() {} },
      '@crm/types': {},
      '@/lib/api/companies.api': { useCompanies: () => ({ data: { data: [] } }) },
      'lucide-react': icons,
    });
    const Form = module[`${kind}Form`];
    const field = kind === 'Company' ? 'name' : 'firstName';
    const key = kind.toLowerCase();
    const a = { [field]: 'First record' },
      b = { [field]: 'Second record' };
    const props = { open: true, onOpenChange() {}, async onSubmit() {} };
    Form({ ...props, [key]: a });
    Form({ ...props, [key]: a });
    assert.equal(resets.length, 1);
    Form({ ...props, [key]: b });
    assert.equal(resets[1][field], 'Second record');
    Form({ ...props, open: false, [key]: b });
    Form({ ...props, [key]: b });
    assert.equal(resets.length, 3);
  });
}
