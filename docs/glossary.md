---
label: Glossary
order: 100
expanded: false
visibility: public
---

Term   | Abbreviation
---    | ---
{{~ for item in term ~}}
[{{ item.key }}](){ #{{ item.key }} } | {{ item.value }}
{{~ end ~}}