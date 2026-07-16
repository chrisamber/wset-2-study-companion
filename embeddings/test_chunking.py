import unittest

from embeddings.chunking import IGNORE_PARTS, SCOPE_ROOTS, VAULT_ROOT, iter_markdown


class CorpusScopeTest(unittest.TestCase):
    def test_only_study_content_is_scanned(self):
        files = iter_markdown(SCOPE_ROOTS, IGNORE_PARTS)
        top_level = {path.relative_to(VAULT_ROOT).parts[0] for path in files}

        self.assertTrue(files)
        self.assertLessEqual(top_level, {"wiki", "raw"})


if __name__ == "__main__":
    unittest.main()
